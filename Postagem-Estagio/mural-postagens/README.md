# Aplicativo de Postagem

Na 1ª Sprint do meu Estagio, eu fiquei encarregado de fazer o MVP Basico (Autenticação + Postagens com Prazo).
- Criar conta do administrador.
- Login e autenticação do administrador.
- Usuário visitante acessa mural sem login.
- Gerenciar Permissões (somente admin posta).
- Criar postagens com título, descrição e mídia.
- Defenir prazo de validade (data/hora).
- Remover/ocultar postagens automaticamente após expirar.
- Visualizar postagens em mural dinâmico.
- Exibir postagens em formato de cards.

E para realizar esse projeto eu utilizei o [VSCode](https://code.visualstudio.com/) e usei a Linguagem [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Rota para criar o Administrador

[Criar Admin](https://estagio-livid.vercel.app/#/create-admin)

## Iniciando o Projeto

```sh
npm install
```

### Entre nas cordenadas do arquivo certo

### Front-end
```sh
cd .\Postagem-Estagio\mural-postagens\ 
```

### Compilar e recarregar rapidamente para desenvolvimento do Front-end

```sh
npm run dev
```

### Back-end

```sh
cd .\Mural-backend\ 
```

### Compilar e recarregar rapidamente para desenvolvimento do Back-end

```sh
node index.js
```

### No frontend voce vai na direção do localhost.

```sh
Local: http://localhost:5173/
```

Ao realizar essas etapas você iria ver o jeito que realizei o projeto.

## Observação:
Caso na hora de Cadastrar o administrador não estiver funcionando, quer dizer que o administrador que eu cadastrei esta registrado, se for assim, use estas informações para realizar o login:

## Usuario

```sh
Carlos
```

### Senha

```sh
1004
```

## Rota de Cadastro:
A rota de Cadastro esta bloqueada, então para compensar e ajudar aqueles que querem criar um Administrador, siga para essa rota

[Criar Administrador](https://estagio-livid.vercel.app/#/create-admin)
