<template>
  <div class="notifications">
    <button @click="toggle">
      Notificações <span v-if="unreadCount">({{ unreadCount }})</span>
    </button>

    <div v-if="open" class="panel">
      <ul>
        <li v-for="n in notifications" :key="n.id" :class="{ unread: !n.is_read }">
          <div>{{ n.message }}</div>
          <small>{{ formatDate(n.created_at) }}</small>
          <button @click="markRead(n)">Marcar como lido</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { connectSocket, getSocket } from '../services/socket';

export default {
  props: ['admin'],
  data() {
    return { notifications: [], open: false };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.is_read).length;
    }
  },
  methods: {
    async load() {
      const res = await axios.get(`${process.env.VUE_APP_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.notifications = res.data;
    },
    formatDate(d) { return new Date(d).toLocaleString(); },
    async markRead(n) {
      await axios.post(`${process.env.VUE_APP_API_URL}/notifications/${n.id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      n.is_read = true;
    },
    toggle() { this.open = !this.open; }
  },
  async mounted() {
    await this.load();
    const token = localStorage.getItem('token');
    const s = connectSocket(token, this.admin.id);
    s.on('notification', (payload) => {
      // push no topo
      this.notifications.unshift({ ...payload, is_read: false });
    });
  }
};
</script>

<style>
.unread { font-weight: bold; }
.panel { position: absolute; background: white; border: 1px solid #ddd; padding: 10px; }
</style>
