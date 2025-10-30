require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const authRoutes = require('../routes/auth');
const postsRoutes = require('../routes/posts');
const { pool } = require('../db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);

// Teste de conexão
pool.connect()
  .then(() => console.log('Conectado ao banco de dados Supabase!'))
  .catch((err) => console.error('Erro ao conectar ao banco de dados:', err));

module.exports = app;
module.exports.handler = serverless(app);
