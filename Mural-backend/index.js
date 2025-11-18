require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const notificationsRoutes = require('./routes/notifications');
const startExpiryCron = require('./services/expiryCron');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/notifications', notificationsRoutes);

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
    cors: { origin: '*'}
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('join-admin', (adminId) => {
        socket.join(`admin_${adminId}`);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
    });
});

startExpiryCron(io);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))