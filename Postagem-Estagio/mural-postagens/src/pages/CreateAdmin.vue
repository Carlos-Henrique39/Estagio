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
      // Verificar se já existe um admin cadastrado
      const existingAdmin = localStorage.getItem("admin");

      if (existingAdmin) {
        this.message = "Já existe uma conta de administrador cadastrada!";
        return;
      }

      // Criar objeto do admin
      const adminData = {
        username: this.username,
        password: this.password,
      };

      // Salvar no localStorage
      localStorage.setItem("admin", JSON.stringify(adminData));

      this.message = "Conta do administrador foi criado com sucesso!";

      // Limpar campos
      this.username = "";
      this.password = "";
    },
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
  background: #585151;
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
  color: green;
  text-align: center;
  font-weight: bold;
}
</style>
