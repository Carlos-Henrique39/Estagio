<template>
  <div class="background">
    <div class="top-bar">
      <router-link to="/" class="btn-voltar">⬅ Voltar ao mural</router-link>
      <button @click="logout" class="btn-logout">Sair</button>
    </div>

    <div class="container">
      <h1>📁 Postagens Arquivadas</h1>

      <div v-if="expiredPosts.length" class="cards">
        <div v-for="post in expiredPosts" :key="post.id" class="card">
          <h2>{{ post.title }}</h2>
          <p>{{ post.description }}</p>
          <p class="expiracao">Expirou em: {{ formatDate(post.expires_at) }}</p>
        </div>
      </div>

      <p v-else class="vazio">Nenhuma postagem arquivada.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ArchivedPosts",
  data() {
    return {
      expiredPosts: [],
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://estagio-mymb.vercel.app/posts/expired", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar postagens arquivadas");
      this.expiredPosts = await response.json();
    } catch (err) {
      console.error(err);
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      const data = date.toLocaleDateString("pt-BR");
      const hora = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return `${data} às ${hora}`;
    },
    logout() {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.background {
  min-height: 100vh;
  background-color: #212121;
  color: white;
  padding: 20px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-voltar {
  background-color: #42b983;
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
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

.btn-voltar:hover {
  background-color: #2c8a65;
}
.btn-logout:hover {
  background-color: #c0392b;
}

.container {
  text-align: center;
  margin-top: 30px;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.card {
  background: #2a2a2a;
  padding: 20px;
  border-radius: 12px;
  width: 280px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.expiracao {
  color: #aaa;
  font-size: 0.9rem;
}

.vazio {
  margin-top: 40px;
  font-size: 1.1rem;
  color: #aaa;
}
</style>
