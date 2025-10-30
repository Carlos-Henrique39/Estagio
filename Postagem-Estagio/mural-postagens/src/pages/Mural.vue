<template>
  <div class="background">
    <div class="direita">
      <router-link v-if="!isAdmin" to="/login" class="btn-login">Login</router-link>
      <button v-else @click="logout" class="btn-logout">Sair</button>
    </div>

    <div class="mural-container">
      <h1>Vagas</h1>

      <div class="actions" v-if="isAdmin">
        <router-link to="/create-post" class="btn-create">+ Nova Postagem</router-link>
        <router-link to="/archived-posts" class="btn-archive">📁 Ver Arquivadas</router-link>
      </div>

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
    };
  },
  computed: {
    visiblePosts() {
      return this.posts.slice(this.currentIndex, this.currentIndex + 3);
    },
  },
  async created() {
    this.isAdmin = localStorage.getItem("isLoggedIn") === "true";
    await this.loadPosts(); // 🔹 Busca os posts do backend
  },
  methods: {
    async loadPosts() {
      try {
        const response = await fetch("http://estagio-mymb.vercel.app/posts");
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
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Erro ao excluir postagem");
        alert("Postagem excluída com sucesso!");
        await this.loadPosts(); // Atualiza a lista
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
      const data = date.toLocaleDateString('pt-BR');
      const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${data} às ${hora}`;
    },
  },
};
</script>


<style scoped>

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

</style>
