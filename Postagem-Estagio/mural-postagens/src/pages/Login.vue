<template>
  <div class="background">
    <div class="login-container">
      <h1>Login</h1>

      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Nome de Usuário:</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Digite o seu nome de usuario"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Senha:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Digite a sua senha"
            required
          />
        </div>

        <!-- <div class="link-cadastro">
          <label for="text" class="font">
            <RouterLink to="/create-admin" class="cadastro-link">Esqueceu a senha?</RouterLink>
          </label>
        </div> -->

        <!-- <div class="link-cadastro">
          <label for="text" class="font">
            <RouterLink to="/create-admin" class="cadastro-link">Criar uma conta</RouterLink>
          </label>
        </div> -->

        <button type="submit" class="btn-login">Entrar</button>
      </form>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    login() {
      const adminData = JSON.parse(localStorage.getItem("admin"));

      if (!adminData) {
        this.errorMessage = "Nenhum administrador cadastrado!";
        return;
      }

      if (
        this.username === adminData.username &&
        this.password === adminData.password
      ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("loggedUser", this.username);

        this.$router.push("/mural");
      } else {
        this.errorMessage = "Usuário ou senha incorretos!";
      }
    },
  },
};
</script>

<style scoped>
.background {
  background-color: #1c1c1c;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  width: 380px;
  padding: 30px 25px;
  border-radius: 10px;
  background: #2a2a2a;
  color: #fff;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
  text-align: center;
}

.login-container h1 {
  margin-bottom: 20px;
  color: #42b983;
}

.form-group {
  margin-right: 15px;
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: #3b3b3b;
  color: #fff;
}

input:focus {
  outline: 2px solid #42b983;
}

.btn-login {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
}

.btn-login:hover {
  background-color: #2c8a65;
}

.link-cadastro {
  margin-top: 10px;
}

.cadastro-link {
  color: #42b983;
  font-weight: bold;
  text-decoration: none;
}

.cadastro-link:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 15px;
  color: #ff6b6b;
  font-weight: bold;
}
</style>

