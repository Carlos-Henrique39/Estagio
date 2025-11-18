// src/services/socket.js
import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token, adminId) {
  // se seu backend exige token, envie como auth
  socket = io(process.env.VUE_APP_API_URL || 'http://localhost:4000', {
    auth: { token } // opcional se você quiser autenticar no server side
  });
  socket.on('connect', () => {
    console.log('socket connected', socket.id);
    // entrar em room admin
    socket.emit('join-admin', adminId);
  });
  return socket;
}

export function getSocket() { return socket; }
