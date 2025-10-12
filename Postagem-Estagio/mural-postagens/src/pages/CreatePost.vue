<template>
  <div class="background">
    <h1>Criar Postagem</h1>
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
      </div>

      <div class="form-group">
        <label for="expiresAt">Data de Expiração:</label>
        <input
          type="date"
          id="expiresAt"
          v-model="expiresAt"
          required
        />
      </div>
      <div class="form-group">
        <label for="expiresTime">Hora de Expiração:</label>
        <input
          type="time"
          id="expiresTime"
          v-model="expiresTime"
          required
        />
      </div>

      <button type="submit">Salvar Postagem</button>
    </form>

      <label for="text" class="font">Criou a postagem?
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
      expiresAt: "",
      expiresTime: "",
    };
  },
  methods: {
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
    addPost() {
      if (!this.title || !this.description || !this.expiresAt || !this.expiresTime) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      const posts = JSON.parse(localStorage.getItem("posts")) || [];

      const [year, month, day] = this.expiresAt.split("-").map(Number);
      const [hour, minute] = this.expiresTime.split(":").map(Number);

      const expirationDate = new Date(year, month - 1, day, hour, minute);

      const newPost = {
        id: Date.now(),
        title: this.title,
        description: this.description,
        image: this.image,
        expiresAt: expirationDate.getTime(),
      };

      posts.push(newPost);
      localStorage.setItem("posts", JSON.stringify(posts));

      alert("✅ Postagem salva com sucesso!");

      this.$router.push("/mural");
    },
  },
};
</script>

<style scoped>

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
