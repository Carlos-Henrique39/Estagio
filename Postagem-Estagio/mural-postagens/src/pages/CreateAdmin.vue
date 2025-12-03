<template>
  <div class="create-admin-container">
    <h2>Criar Conta de Administrador</h2>

    <form @submit.prevent="createAdmin">
      <div class="form-group">
        <label for="username">Nome de Usuário:</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="Usuário"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Senha:</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="insira a senha"
          required
        />
      </div> 
      <div>
        <label for="text" class="font">Criou a conta?
          <RouterLink to="/login">Login</RouterLink>
        </label>
      </div>
      <button type="submit">Salvar Conta</button>
    </form>

    <p v-if="message" class="success-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: "CreateAdmin",
  data() {
    return {
      username: "",
      password: "",
      message: "",
    };
  },
  methods: {
    createAdmin() {
      if (!this.username || !this.password) {
        alert("Preencha todos os campos!");
        return;
      }

      const admins = JSON.parse(localStorage.getItem("admins")) || [];

      const existing = admins.find(admin => admin.username === this.username);
      if (existing) {
        alert("Este nome de usuário já está sendo usado!");
        return;
      }

      admins.push({
        username: this.username,
        password: this.password,
      });

      localStorage.setItem("admins", JSON.stringify(admins));

      alert("✅ Administrador criado com sucesso!");
      this.$router.push("/login");
    }

  },
};
</script>

<style scoped>
.create-admin-container {
  max-width: 450px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: rgb(119, 111, 111);
}

.form-group {
  margin-right: 15px;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
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
  color: white;
  text-align: center;
  font-weight: bold;
}
</style>
