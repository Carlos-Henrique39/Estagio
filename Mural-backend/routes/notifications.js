// routes/notifications.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {

    const postsExpiringSoon = await db.query(`
      SELECT id, title, expires_at
      FROM posts
      WHERE is_active = true
        AND expires_at IS NOT NULL
        AND expires_at > NOW()
        AND expires_at < NOW() + INTERVAL '24 HOURS'
    `);

    for (const post of postsExpiringSoon.rows) {

      const exists = await db.query(`
        SELECT id FROM notifications WHERE post_id = $1
      `, [post.id]);

      if (exists.rowCount === 0) {
        await db.query(`
          INSERT INTO notifications (title, message, post_id, created_at, read)
          VALUES ($1, $2, $3, NOW(), false)
        `, [
          "Post expirando em breve",
          `A postagem "${post.title}" irá expirar dentro de 24 horas.`,
          post.id
        ]);
      }
    }

    const result = await db.query(
      `SELECT id, title, message, created_at, read 
       FROM notifications
       ORDER BY created_at DESC 
       LIMIT 100`
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { title, message, target_all = true } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO notifications (title, message, target_all, created_at, read)
       VALUES ($1,$2,$3, NOW(), false) RETURNING id, title, message, created_at, read`,
      [title, message, target_all]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar notificação' });
  }
});

router.patch('/:id/read', authenticate, requireAdmin, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      `UPDATE notifications SET read = true WHERE id = $1 RETURNING id, read`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar notificação' });
  }
});

module.exports = router;
