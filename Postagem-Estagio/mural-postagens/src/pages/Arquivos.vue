<template>
  <div class="background">
    <div class="top-bar">
      <router-link to="/" class="btn-voltar">⬅ Voltar ao mural</router-link>
      <button @click="logout" class="btn-logout">Sair</button>
    </div>

    <div class="container">
      <h1>📁 Histórico de Postagens</h1>
      <button class="btn-download" @click="toggleDownloadMenu">⬇ Download</button>

      <div v-if="showDownloadMenu" class="download-menu">
        <button @click="downloadCSV">📄 Baixar CSV</button>
        <button @click="downloadPDF">📕 Baixar PDF</button>
      </div>

      <div v-if="expiredPosts.length" class="cards">
        <div v-for="post in expiredPosts" :key="post.id" class="card">
          <h2>{{ post.title }}</h2>
          <img v-if="post.image" 
          :src="post.image" 
          alt="Imagem da Postagem"
          @click="openImageModal(post.image)"
          class="post-image clickable-img"
          />
          <p>{{ post.description }}</p>
          <div v-if="post.links && post.links.length" class="links">
            <h3>Links:</h3>
            <ul>
              <li v-for="(l, i) in post.links" :key="i">
                <a :href="l" target="_blank">{{ l }}</a>
              </li>
            </ul>
          </div>

          <div v-if="post.files && post.files.length" class="files">
            <h3>Arquivos:</h3>
            <ul>
              <li v-for="(f, i) in post.files" :key="i">
                <a :href="f.data" :download="f.name">📄 {{ f.name }}</a>
              </li>
            </ul>
          </div>
          <p class="expiracao">Data de criação: {{ formatDate(post.created_at) }}</p>
          <p class="expiracao">Expirou em: {{ formatDate(post.expires_at) }}</p>
        </div>
      </div>

      <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
        <img :src="modalImageSrc" class="modal-image" @click.stop>
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
      showImageModal: false,
      modalImageSrc: "",
      showDownloadMenu: false,
    };
  },
  async mounted() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/posts/expired", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar postagens arquivadas");
      this.expiredPosts = await response.json();
    } catch (err) {
      console.error(err);
    }
  },
  methods: {

    toggleDownloadMenu() {
      this.showDownloadMenu = !this.showDownloadMenu;
    },

    downloadCSV() {
      const rows = [
        ["Título", "Descrição", "Imagem", "Links", "Arquivos", "Criado em", "Expirou em"],
        ...this.expiredPosts.map(p => [
          p.title,
          p.description,
          p.links?.join(" | ") || "",
          p.files?.map(f => f.name).join(" | ") || "",
          this.formatDate(p.created_at),
          this.formatDate(p.expires_at)
        ])
      ];

      const csv = rows.map(r => r.map(v =>
      `"${String(v).replace(/"/g, '""')}"`
      ).join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "historico.csv";
      link.click();
    },

    async downloadPDF() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/posts/expired/export/pdf", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "historico.pdf";
        link.click();
      } catch (err) {
        console.error("Erro ao baixar PDF", err);
      }
    },

    openImageModal(src) {
      this.modalImageSrc = src;
      this.showImageModal = true;
    },

    closeImageModal() {
      this.showImageModal = false;
    },

    formatDate(date) {
      return new Date(date).toLocaleString('pt-BR');
    },

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
  }
};
</script>

<style scoped>

.btn-download {
  display: inline-block;
  background-color: #3498db;
  padding: 10px 15px;
  color: black;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: bold;
}

.download-menu {
  position: relative;
  margin: 10px auto;         
  width: 180px;               
  background: #2c2c2c;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}


.download-menu button {
  background-color: rgb(165, 161, 161);
  color: black;
  padding: 8px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.download-menu button:hover {
  background: #555;
}

.clickable-img {
  cursor: zoom-in;
}

.image-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  cursor: zoom-out;
}

.image-modal img.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 10px;
  cursor: default;
}

.post-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
}

.links ul, .files ul {
  list-style: none;
  padding: 0;
}

.links a, .files a {
  color: #42b983;
  text-decoration: underline;
}

.background {
  width: 1366px;
  min-height: 100vh;
  background-color: rgb(119, 111, 111);
  color: white;
  
}

.top-bar {
  background-color: #212121;
  padding: 20px ;
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
  color: black;
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
  border: 2px solid black;
  background: white;
  color: black;
  padding: 20px;
  border-radius: 12px;
  width: 280px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.expiracao {
  color: #2b2a2a;
  font-size: 0.9rem;
}

.vazio {
  margin-top: 40px;
  font-size: 1.1rem;
  color: #aaa;
}
</style>
