<template>
  <div class="background">
    <div class="direita">
      <router-link v-if="!isAdmin" to="/login" class="btn-login">Login</router-link>

      <button
        v-if="isAdmin"
        class="btn-notifications"
        @click="togglePopup"
        aria-haspopup="dialog"
        :aria-expanded="showPopup.toString()"
      >
        🔔
        <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
      </button>

      <button v-if="isAdmin" @click="logout" class="btn-logout">Sair</button>
    </div>

    <div class="mural-container">
      <div class="actions" v-if="isAdmin">
        <router-link to="/create-post" class="btn-create">Nova Postagem</router-link>
        <router-link to="/archived-posts" class="btn-archive">Histórico de Postagens</router-link>
      </div>

      <h1>Vagas</h1>

      <p v-if="posts.length === 0" class="sem-posts">
        Nenhuma postagem disponível no momento.
      </p>

      <div v-else class="carousel">
        <button class="arrow left" @click="prevGroup" :disabled="currentIndex === 0">
          ◀
        </button>

        <div class="post-list">
          <div
            v-for="(post, index) in visiblePosts"
            :key="post.id"
            class="post-card"
          >
            <h2>{{ post.title }}</h2>
            <p class="descricao">{{ post.description }}</p>
            <img v-if="post.image" :src="post.image" alt="Imagem da postagem" />
            <p class="expira-em">Expira em: {{ formatDate(post.expires_at) }}</p>

            <div v-if="isAdmin" class="post-actions">
              <button @click="editPost(post.id)" class="btn-edit">Editar</button>
              <button @click="deletePost(post.id)" class="btn-delete">Excluir</button>
            </div>
          </div>
        </div>

        <button
          class="arrow right"
          @click="nextGroup"
          :disabled="currentIndex + 3 >= posts.length"
        >
          ▶
        </button>
      </div>
    </div>

    <div v-if="isAdmin && showPopup" class="overlay" @click.self="closePopup">
      <div class="popup" role="dialog" aria-label="Notificações">
        <div class="popup-header">
          <h3>Notificações</h3>

          <button class="clear-btn" @click="clearAllNotifications">
            Limpar todas
          </button>

          <button class="close-btn" @click="closePopup" aria-label="Fechar">✕</button>
        </div>

        <div class="popup-content">
          <ul v-if="notifications.length > 0" class="notif-list">
            <li
              v-for="(n, i) in notifications"
              :key="n.id"
              class="notif-item"
              @click="markAsRead(n.id)"
            >
              <strong>{{ n.title }}</strong>
              <p class="notif-text">{{ n.message }}</p>
              <small class="notif-date">{{ formatDate(n.created_at) }}</small>
            </li>
          </ul>

          <div v-else class="no-notif">
            <p>Nenhuma notificação ainda.</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "Mural",
  data() {
    return {
      posts: [],
      isAdmin: false,
      currentIndex: 0,
      showPopup: false,
      notifications: [],
    };
  },
  computed: {
    visiblePosts() {
      return this.posts.slice(this.currentIndex, this.currentIndex + 3);
    },
    unreadCount() {
      return this.notifications.filter(n => !n.read).length;
    }
  },
  async created() {
    this.isAdmin = localStorage.getItem("isLoggedIn") === "true";
    await this.loadPosts();
    if (this.isAdmin) {
      this.loadNotifications();
    }
  },
  methods: {
    async loadPosts() {
      try {
        const response = await fetch("http://localhost:4000/posts");
        if (!response.ok) throw new Error("Erro ao carregar postagens");

        const data = await response.json();
        const now = new Date();

        this.posts = data
          .filter(post => new Date(post.expires_at) > now)
          .map(post => ({
            ...post,
            expires_at: new Date(post.expires_at)
          }));
      } catch (err) {
        console.error("Erro ao carregar postagens:", err);
      }
    },

    async deletePost(id) {
      if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:4000/posts/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Erro ao excluir postagem");

        await this.loadPosts();

      } catch (err) {
        console.error(err);
        alert("Erro ao excluir postagem");
      }
    },

    editPost(id) {
      this.$router.push(`/create-post?id=${id}`);
    },

    logout() {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      this.isAdmin = false;
      this.$router.push("/mural");
    },

    nextGroup() {
      if (this.currentIndex + 3 < this.posts.length) {
        this.currentIndex += 3;
      }
    },

    prevGroup() {
      if (this.currentIndex > 0) {
        this.currentIndex -= 3;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "Sem data de expiração";

      const date = new Date(dateString);
      if (isNaN(date)) return "Data Inválida";

      const data = date.toLocaleDateString("pt-BR");
      const hora = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });

      return `${data} às ${hora}`;
    },

    async togglePopup() {
      this.showPopup = !this.showPopup;

      if (this.showPopup) {
        await this.loadNotifications();

        await this.markAllReadBackend();

        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
      }
    },

    closePopup() {
      this.showPopup = false;
    },

    async loadNotifications() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:4000/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Erro ao carregar notificações");

        const data = await res.json();

        this.notifications = data.map(n => ({
          ...n,
          created_at: n.created_at ? new Date(n.created_at) : null
        }));

      } catch (err) {
        console.error("Erro ao carregar notificações:", err);
      }
    },

    async markAllReadBackend() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:4000/notifications/mark-all-read', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          console.warn('markAllReadBackend: resposta não ok', res.status);
        }
      } catch (err) {
        console.error('Erro em markAllReadBackend:', err);
      }
    },

    async clearAllNotifications() {
      if (!confirm("Tem certeza que deseja limpar todas as notificações?")) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:4000/notifications/clear", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Erro ao limpar notificações");

        this.notifications = [];
      } catch (err) {
        console.error("Erro ao limpar notificações:", err);
      }
    }
  }
};
</script>

<style scoped>

.clear-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s ease-in-out;
  margin-right: auto;
}

.clear-btn:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}

.clear-btn:active {
  transform: scale(0.95);
  background-color: #a93226;
}

.btn-notifications {
  display: inline-block;
  padding: 8px 12px;
  margin-right: 10px;
  background-color: #9e8e6c;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-notifications:hover { 
  background-color: #6d624b;
 }

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 70px 30px 0 0;
  z-index: 9999;
}

.popup {
  width: 320px;
  max-height: 70vh;
  background: #1f1f1f;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  padding: 12px 14px;
  overflow: auto;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding-bottom: 8px;
}

.close-btn {
  border: none;
  background: transparent;
  color: #ddd;
  font-size: 16px;
  cursor: pointer;
}

.popup-content {
  margin-top: 8px;
}

.notif-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notif-item {
  background: rgba(255,255,255,0.02);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.notif-item strong { 
  display: block; 
  margin-bottom: 4px; 
  color: white; 
}
.notif-text { 
  margin: 0 0 6px 0; 
  color: #ddd; 
  font-size: 0.95rem; 
}
.notif-date { 
  color: #aaa; 
  font-size: 0.75rem; 
}

.no-notif {
  padding: 14px;
  text-align: center;
  color: #ddd;
}

/* --- Restante do seu CSS mantido --- */
.btn-archive {
  display: inline-block;
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  margin-left: 10px;
  transition: background 0.3s;
}

.btn-archive:hover {
  background-color: #2980b9;
}


.archived-section h2 {
  color: #888;
}

.post-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.btn-edit, .btn-delete {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-edit:hover { background-color: #2980b9; }
.btn-delete:hover { background-color: #c0392b; }

.welcome-msg{
  text-align: center;
  font-weight: 600;
  color:#2b7a78;
  background-color: #def2f1;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 10px auto 20px;
  width: fit-content;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.btn-logout {
  display: inline-block;
  padding: 10px 15px;
  background-color: #e74c3c;
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-logout:hover {
  background-color: #c0392b;
}

.direita {
  display: flex;
  justify-content: flex-end;
  margin: 20px 40px 0 0;
}

.btn-login,
.btn-create {
  display: inline-block;
  padding: 10px 15px;
  background-color: #42b983;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-login:hover,
.btn-create:hover {
  background-color: #2c8a65;
}

.background {
  min-height: 100vh;
  width: 100%;
  background-color: #212121;
  overflow: auto;
  padding-bottom: 60px;
}

.mural-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  color: #fff;
  text-align: center;
}

.actions {
  margin-bottom: 20px;
}

.carousel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
}

.post-list {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: nowrap;
  transition: transform 0.3s ease;
}

.post-card {
  background: #2a2a2a;
  color: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
  width: 280px;
  min-height: 340px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  text-align: left;
}

.post-card h2 {
  margin-bottom: 15px;
  color: #42b983;
}

.descricao {
  margin-bottom: 15px;
  font-size: 1rem;
  color: #ddd;
  line-height: 1.5;
}

.post-card img {
  max-width: 100%;
  border-radius: 6px;
  margin: 10px 0;
}

.expira-em {
  font-size: 0.85rem;
  color: #aaa;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #42b983;
  border: none;
  padding: 10px 14px;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s;
  z-index: 5;
}
.arrow:hover {
  background-color: #2c8a65;
}
.arrow:disabled {
  background-color: #555;
  cursor: not-allowed;
}
.arrow.left {
  left: -60px;
}
.arrow.right {
  right: -60px;
}

.fade-enter-active, 
.fade-leave-active{
  transition: opacity 1s ease;
}

.fade-enter, 
.fade-leave-to{
  opacity: 0;
}

.notif-badge{
  display:inline-block;
  min-width:20px;
  padding:2px 6px;
  font-size:12px;
  font-weight:700;
  background:#e74c3c;
  color:#fff;
  border-radius:12px;
  margin-left:8px;
  vertical-align:middle;
}

</style>
