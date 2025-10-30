require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const authRoutes = require('../routes/auth');
const postsRoutes = require('../routes/posts');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);

module.exports = app;
module.exports.handler = serverless(app);
