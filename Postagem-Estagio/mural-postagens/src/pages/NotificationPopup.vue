<template>
  <div class="notif-wrapper" v-if="visible" @keydown.esc="close" tabindex="-1" ref="container">
    <div class="notif-card" role="dialog" aria-label="Notificações">

      <header class="notif-header">
        <h3>Notificações</h3>
        <div class="header-actions">
          <button class="btn-small" @click="markAllRead" :disabled="notifications.length === 0">
            Marcar todas lidas
          </button>
          <button class="btn-close" @click="close" aria-label="Fechar">✕</button>
        </div>
      </header>

      <main class="notif-body">
        <div v-if="notifications.length === 0" class="empty">
          Sem notificações
        </div>

        <ul v-else class="notif-list">
          <li
            v-for="n in notifications"
            :key="n.id"
            class="notif-item"
            :class="{ 'notif-unread': !n.read }"
          >
            <div style="display:flex; justify-content:space-between; gap:8px;">
              
              <div style="flex:1;">
                <strong>{{ n.title }}</strong>
                <p class="notif-text">{{ n.message }}</p>
                <small class="notif-date">{{ formatDate(n.created_at) }}</small>
              </div>

              <button
                v-if="!n.read"
                @click="markAsRead(n.id)"
                class="btn-mark-read"
              >
                Marcar como lida
              </button>

            </div>
          </li>
        </ul>
      </main>

      <button class="notif-footer" @click="markAllRead">
        Marcar todas como lidas
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  modelValue: Boolean,
  apiUrl: { type: String, default: "http://localhost:4000" }
});
const emit = defineEmits(["update:modelValue", "open", "close"]);

const visible = ref(props.modelValue);
const notifications = ref([]);
const container = ref(null);

function open() {
  visible.value = true;
  emit("update:modelValue", true);
  emit("open");
  nextTick(() => container.value?.focus());
}

function close() {
  visible.value = false;
  emit("update:modelValue", false);
  emit("close");
}


async function loadNotifications() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${props.apiUrl}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao carregar notificações");

    const data = await res.json();
    notifications.value = data;

  } catch (err) {
    console.error("Erro ao carregar notificações:", err);
  }
}

async function markAsRead(id) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${props.apiUrl}/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Erro ao marcar como lida");

    notifications.value = notifications.value.filter(n => n.id !== id);

  } catch (err) {
    console.error("Erro ao marcar como lida:", err);
  }
}

async function markAllRead() {
  try {
    const token = localStorage.getItem("token");

    await fetch(`${props.apiUrl}/notifications/mark-all-read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    });

    notifications.value = [];

  } catch (err) {
    console.error("Erro ao marcar todas como lidas:", err);
  }
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("pt-BR");
}

// Reatividade
watch(() => props.modelValue, async (v) => {
  visible.value = v;
  if (v) await loadNotifications();
});
</script>


<style scoped>
.notif-wrapper {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 1200;
  outline: none;
}
.notif-card {
  width: 320px;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.2);
  overflow: hidden;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
.notif-header {
  display:flex;
  justify-content: space-between;
  align-items:center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}
.notif-body {
  padding: 8px;
  overflow: auto;
}
.notif-list { 
    list-style:none; 
    padding:0; 
    margin:0; 
}
.notif-list li { 
    display:flex; 
    justify-content:space-between; 
    gap:10px; 
    padding:10px; 
    border-radius:6px; 
    margin-bottom:6px; 
    background: #fafafa; 
}

.notif-list li.unread { 
    background: #f0f8ff; 
    box-shadow: inset 0 0 0 2px rgba(0,120,255,0.06); 
}

.left { 
    flex:1; 
}

.right { 
    display:flex; 
    flex-direction:column; 
    align-items:flex-end; 
    gap:6px; 
    min-width:90px; 
}

.title { 
    display:block; 
    font-size:13px; 
    margin-bottom:4px; 
}
.text { 
    margin:0; 
    font-size:12px; 
    color:#444; 
}
.time { 
    font-size:11px; 
    color:#888; 
}
.actions { 
    display:flex; 
    flex-direction:column; 
    gap:4px; 
    align-items:flex-end; 
}
.btn { 
    padding:8px 12px; 
    border-radius:6px; 
    border: none; 
    background:#1976d2; 
    color:white; 
    cursor:pointer; 
}
.btn-small { 
    padding:6px 8px; 
    font-size:12px; 
    border-radius:6px; 
    border: none; 
    background:#eee; 
    cursor:pointer; 
}
.btn-close { 
    border:none; 
    background:transparent; 
    font-size:16px; 
    cursor:pointer; 
}
.btn-link { 
    background:transparent; 
    border:none; 
    font-size:12px; 
    cursor:pointer; 
    color:#1976d2; 
}

.btn-link.danger { 
    color:#d32f2f; }

.empty { 
    padding:16px; 
    color:#666; 
    text-align:center; }
.notif-footer { 
    padding:10px; 
    border-top:1px solid #eee; 
    display:flex; 
    justify-content:flex-end; 
}
@media (max-width:420px) {
  .notif-card { 
    width: 92vw; 
    right:4vw; 
    left:4vw; 
    top:60px; }
}
.notif-unread { 
    box-shadow: 0 4px 14px rgba(231,76,60,0.06); 
    border-left: 4px solid #e74c3c; 
}
.btn-mark-read { 
    border:none; 
    background:#42b983; 
    color:#fff; 
    padding:6px 8px; 
    border-radius:6px; 
    cursor:pointer; 
    font-weight:700; 
}
</style>
