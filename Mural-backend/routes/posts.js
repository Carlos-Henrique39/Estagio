const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, image, expires_at } = req.body;
    const author_id = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }

    const result = await db.query(
      `INSERT INTO posts (title, description, image, author_id, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, image, author_id, created_at, expires_at, is_active`,
      [title, description, image, author_id, expires_at || null]
    );

    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar postagem' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, expires_at } = req.body;

  try {
    const result = await db.query(
      `UPDATE posts
       SET title = $1, description = $2, image = $3, expires_at = $4
       WHERE id = $5
       RETURNING *`,
      [title, description, image, expires_at || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Postagem não encontrada' });
    }

    res.json({ message: 'Postagem atualizada com sucesso', post: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar postagem' });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Postagem não encontrada' });
    }

    res.json({ message: 'Postagem deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar postagem' });
  }
});


router.get('/', async (req, res) => {
  try {
    await db.query(
      `UPDATE posts
       SET is_active = false
       WHERE expires_at IS NOT NULL AND expires_at < NOW() AND is_active = true`
    );

    const result = await db.query(
      `SELECT * FROM posts 
       WHERE is_active = true 
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar postagens ativas' });
  }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`SELECT * FROM posts WHERE id = $1`, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Postagem não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar postagem específica' });
    }
});

router.get('/expired', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM posts 
       WHERE is_active = false 
       OR (expires_at IS NOT NULL AND expires_at < NOW())
       ORDER BY expires_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar postagens expiradas' });
  }
});

module.exports = router;
