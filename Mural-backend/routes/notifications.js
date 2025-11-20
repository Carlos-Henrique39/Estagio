// routes/notifications.js
const express = require('express');
const db = require('../db');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /notifications  -> retorna notificações (apenas admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, message, created_at, read FROM notifications
       ORDER BY created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST /notifications -> criar notificação (apenas admin, opcional)
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

// PATCH /notifications/:id/read -> marcar como lida (apenas admin)
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
