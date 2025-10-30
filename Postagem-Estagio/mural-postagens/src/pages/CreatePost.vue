<template>
  <div class="background">
    <h1>{{ isEditing ? "Editar Postagem" : "Criar Postagem" }}</h1>

    <form @submit.prevent="addPost">
      <div class="form-group">
        <label for="title">Título:</label>
        <input
          type="text"
          id="title"
          v-model="title"
          placeholder="Digite o título da postagem"
          required
        />
      </div>

      <div class="form-group">
        <label for="description">Descrição:</label>
        <textarea
          id="description"
          v-model="description"
          placeholder="Digite a descrição"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="image">Imagem (opcional):</label>
        <input type="file" id="image" @change="handleImage" accept="image/*" />
        <img
          v-if="image"
          :src="image"
          alt="Pré-visualização"
          class="preview_img"
        
        />
      </div>

      <div class="form-group">
        <label for="expiresAt">Data de Expiração:</label>
        <input type="date" id="expires_at" v-model="expires_at" required />
      </div>

      <div class="form-group">
        <label for="expiresTime">Hora de Expiração:</label>
        <input type="time" id="expiresTime" v-model="expiresTime" required />
      </div>

      <button type="submit">
        {{ isEditing ? "Salvar Alterações" : "Salvar Postagem" }}
      </button>
    </form>

    <label for="text" class="font">
      Criou a postagem?
      <RouterLink to="/mural">Mural</RouterLink>
    </label>
  </div>
</template>

<script>
export default {
  name: "CreatePost",
  data() {
    return {
      title: "",
      description: "",
      image: null,
      expires_at: "",
      expiresTime: "",
      isEditing: false,
      editId: null,
    };
  },

  async created() {
    // Pega o id da query string (ex: /create-post?id=3)
    const id = this.$route.query.id;
    if (id) {
      this.isEditing = true;
      this.editId = id;
      await this.loadPost(id);
    }
  },

  methods: {
    async loadPost(id) {
      try {
        const response = await fetch(`http://localhost:4000/posts/${id}`);
        if (!response.ok) throw new Error("Erro ao carregar postagem.");
        const post = await response.json();

        // Preenche os campos do formulário
        this.title = post.title;
        this.description = post.description;
        this.image = post.image || null;

        if (post.expires_at) {
          const date = new Date(post.expires_at);
          this.expires_at = date.toISOString().slice(0, 10);
          this.expiresTime = date.toTimeString().slice(0, 5);
        }
      } catch (err) {
        console.error("Erro ao carregar a postagem:", err);
      }
    },

    handleImage(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.image = reader.result;
        };
        reader.readAsDataURL(file);
      }
    },

    async addPost() {
      if (!this.title || !this.description || !this.expires_at || !this.expiresTime) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      const [year, month, day] = this.expires_at.split("-");
      const [hour, minute] = this.expiresTime.split(":");
      const expirationDate = new Date(year, month - 1, day, hour, minute);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Você precisa estar logado como administrador.");
        return;
      }

      const postData = {
        title: this.title,
        description: this.description,
        image: this.image,
        expires_at: expirationDate.toISOString(),
      };

      try {
        const url = this.isEditing
          ? `http://localhost:4000/posts/${this.editId}`
          : "http://localhost:4000/posts";

        const method = this.isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao salvar postagem.");

        alert(this.isEditing ? "Postagem atualizada com sucesso!" : "✅ Postagem criada com sucesso!");
        this.$router.push("/mural");
      } catch (error) {
        console.error(error);
        alert("Erro: " + error.message);
      }
    },
  },
};
</script>


<style scoped>

.preview-img {
  width: 200px;
  margin-top: 10px;
  border-radius: 8px;
}

.background{
  background-color: #212121;
}

.create-post-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

label {
  color: white;
  margin-left: 10px;
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

h1 {
  width: 70%;
  margin-left: 10px;
  padding: 8px;
}

input[type="text"],
input[type="date"],
input[type="file"] {
  width: 70%;
  margin-left: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  height: 140px;
  width: 70%;
  margin-left: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input[type="time"]{
  width: 50px;
  margin-left: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  justify-content: center;
  margin-left: 10px;
  width: 975px;
  padding: 10px;
  background-color: #42b983;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #369870;
}

.success-message {
  margin-top: 15px;
  color: green;
  text-align: center;
  font-weight: bold;
}
</style>
