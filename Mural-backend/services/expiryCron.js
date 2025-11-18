const cron = require('node-cron');
const db = require('../db');
const { sendAdminEmail } = require('./mailer');

const NOTIFY_WINDOWS_DAYS = [7, 3, 1]; // dias antes
const CRON_SCHEDULE = '0 * * * *'; // a cada 10 minutos (ajuste conforme quiser)

function formatMsg(post, daysLeft) {
  return `A postagem "${post.title}" expira em ${daysLeft} dia(s) em ${post.expires_at}.`;
}

async function findPostsToNotify(daysWindow) {
  // posts que expiram entre now+daysWindow e now+(daysWindow - 1) dias
  const { rows } = await db.query(`
    SELECT * FROM posts
    WHERE is_active = true
      AND expires_at IS NOT NULL
      AND expires_at BETWEEN now() + $1::interval AND now() + ($1::interval + '24 hours'::interval)
  `, [`${daysWindow} days`]);
  return rows;
}

async function hasNotificationForPost(post_id, type) {
  const { rowCount } = await db.query(
    `SELECT 1 FROM notifications WHERE post_id=$1 AND type=$2 LIMIT 1`,
    [post_id, type]
  );
  return rowCount > 0;
}

module.exports = function startExpiryCron(io) {
  // rodar imediatamente uma vez
  runCheck(io).catch(err => console.error('expiryCron initial error', err));

  // agendar
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      await runCheck(io);
    } catch (err) {
      console.error('expiryCron error', err);
    }
  });
};

async function runCheck(io) {
  console.log('Running expiry check', new Date().toISOString());

  // 1) checar NOTIFY_WINDOWS_DAYS
  for (const d of NOTIFY_WINDOWS_DAYS) {
    const posts = await findPostsToNotify(d);
    for (const post of posts) {
      const type = `expiring_${d}d`;
      if (await hasNotificationForPost(post.id, type)) continue;

      // criar notificação (para todos os admins — ou configure target admin)
      // pegar admins (simples)
      const adminsRes = await db.query(`SELECT id, email FROM admins`);
      for (const admin of adminsRes.rows) {
        const msg = formatMsg(post, d);
        await db.query(
          `INSERT INTO notifications (admin_id, post_id, type, message, meta)
           VALUES ($1,$2,$3,$4,$5)`,
          [admin.id, post.id, type, msg, JSON.stringify({ days: d, expires_at: post.expires_at })]
        );

        // emit via socket para admin room
        try {
          io.to(`admin_${admin.id}`).emit('notification', {
            post_id: post.id,
            type,
            message: msg,
            created_at: new Date()
          });
        } catch (e) { console.warn('socket emit error', e); }

        // enviar email se configurado
        if (process.env.SMTP_HOST) {
          try {
            await sendAdminEmail(admin.email, `Post expirando em ${d} dia(s)`, msg);
          } catch (e) {
            console.error('email error', e);
          }
        }
      }
    }
  }

  // 2) checar posts já expirados -> mover para expired_posts / notificar uma vez
  const expired = await db.query(`
    SELECT * FROM posts
    WHERE is_active = true
      AND expires_at IS NOT NULL
      AND expires_at <= now()
  `);
  for (const post of expired.rows) {
    const type = `expired`;
    if (await hasNotificationForPost(post.id, type)) continue;

    // desativar post e inserir em expired_posts (se quiser)
    await db.query(`UPDATE posts SET is_active=false WHERE id=$1`, [post.id]);
    await db.query(
      `INSERT INTO expired_posts (original_post_id, title, description, author_id, expired_at)
       VALUES ($1,$2,$3,$4, now())`,
      [post.id, post.title, post.description, post.author_id]
    );

    // notificar admins
    const adminsRes = await db.query(`SELECT id, email FROM admins`);
    for (const admin of adminsRes.rows) {
      const msg = `A postagem "${post.title}" expirou agora.`;
      await db.query(
        `INSERT INTO notifications (admin_id, post_id, type, message, meta)
         VALUES ($1,$2,$3,$4,$5)`,
        [admin.id, post.id, type, msg, JSON.stringify({ expired_at: post.expires_at })]
      );
      io.to(`admin_${admin.id}`).emit('notification', { post_id: post.id, type, message: msg, created_at: new Date() });

      if (process.env.SMTP_HOST) {
        try { await sendAdminEmail(admin.email, `Post expirado`, msg); } catch (e){ console.error(e); }
      }
    }
  }
}
