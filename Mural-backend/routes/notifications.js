const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth'); // assume que retorna req.user

// GET /notifications -> lista notificações do admin logado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { rows } = await db.query(
      `SELECT id, post_id, type, message, created_at, is_read, meta
       FROM notifications
       WHERE admin_id=$1
       ORDER BY created_at DESC
       LIMIT 100`,
      [adminId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
});

// POST /notifications/:id/read -> marcar como lido
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const id = Number(req.params.id);
    await db.query(`UPDATE notifications SET is_read=true WHERE id=$1 AND admin_id=$2`, [id, adminId]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

module.exports = router;
