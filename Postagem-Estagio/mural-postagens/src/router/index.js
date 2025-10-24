import { createRouter, createWebHashHistory } from 'vue-router';
import CreateAdmin from '../pages/CreateAdmin.vue';
import Login from '../pages/Login.vue';
import CreatePost from '../pages/CreatePost.vue';
import Mural from '../pages/Mural.vue';
import Arquivos from '../pages/Arquivos.vue';

const routes = [
  { path: '/', redirect: '/mural' },
  { path: '/create-admin', component: CreateAdmin },
  { path: '/login', component: Login },
  { path: '/mural', component: Mural },
  {
    path: '/create-post',
    component: CreatePost,
    meta: { requiresAuth: true } 
  },
  { path: '/archived-posts',
    component: Arquivos,
    meta: { requiresAuth: true }
  },
  { path: '/:catchAll(.*)', redirect: '/mural' } 
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (to.meta.requiresAuth && !isLoggedIn) {
    alert("Apenas administradores podem criar postagens!");
    return next("/login");
  }

  if (isLoggedIn && (to.path === "/login" || to.path === "/create-admin")) {
    return next("/mural");
  }

  next();
});

export default router;

