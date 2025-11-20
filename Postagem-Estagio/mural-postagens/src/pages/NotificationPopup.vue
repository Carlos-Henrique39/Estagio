<template>
  <div class="notif-wrapper" v-if="visible" @keydown.esc="close" tabindex="-1" ref="container">
    <div class="notif-card" role="dialog" :aria-label="'Notificações'">
      <header class="notif-header">
        <h3>Notificações</h3>
        <div class="header-actions">
          <button class="btn-small" @click="markAllRead" :disabled="notifications.length === 0">Marcar todas lidas</button>
          <button class="btn-close" @click="close" aria-label="Fechar">✕</button>
        </div>
      </header>

      <main class="notif-body">
        <div v-if="notifications.length === 0" class="empty">
          Sem notificações
        </div>

        <ul v-if="notifications.length > 0" class="notif-list">
        <li v-for="(n, i) in notifications" :key="n.id" class="notif-item" :class="{ 'notif-unread': !n.read }">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div style="flex:1;">
                <strong>{{ n.title }}</strong>
                <p class="notif-text">{{ n.message }}</p>
                <small class="notif-date">{{ formatDate(n.created_at) }}</small>
            </div>

            <div style="margin-left:8px; display:flex; flex-direction:column; gap:6px;">
                <button v-if="!n.read" @click="markAsRead(n.id)" class="btn-mark-read">Marcar como lida</button>
            </div>
            </div>
        </li>
        </ul>
      </main>

      <footer class="notif-footer">
        <button class="btn" @click="clearAll" :disabled="notifications.length===0">Limpar todas</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  storageKey: { type: String, default: 'app_notifications' } // opcional
})
const emit = defineEmits(['update:modelValue', 'open', 'close', 'change'])

const visible = ref(props.modelValue)
const container = ref(null)
const notifications = ref([])

// --- mock/init: carregue do localStorage (ou do backend no futuro)
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(props.storageKey)
    if (raw) {
      notifications.value = JSON.parse(raw)
    } else {
      // Exemplo inicial (apenas se quiser começar com algo)
      notifications.value = [
        { id: 1, title: 'Bem-vindo', message: 'Notificações ativadas!', date: new Date().toISOString(), read: false },
      ]
      saveToStorage()
    }
  } catch (e) {
    notifications.value = []
    console.error('Erro ao carregar notificações', e)
  }
}
function saveToStorage() {
  localStorage.setItem(props.storageKey, JSON.stringify(notifications.value))
  emit('change', notifications.value)
}

// --- manipulações
function open() {
  visible.value = true
  emit('update:modelValue', true)
  emit('open')
  // foco para permitir ESC fechar
  nextTick(() => container.value?.focus())
}
function close() {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}

function toggleRead(notif) {
  notif.read = !notif.read
  saveToStorage()
}

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
  saveToStorage()
}

function remove(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
  saveToStorage()
}

function clearAll() {
  if (!confirm('Remover todas as notificações?')) return
  notifications.value = []
  saveToStorage()
}

function formatTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch { return iso }
}

// reatividade com prop v-model
watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => emit('update:modelValue', v))

onMounted(() => loadFromStorage())
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
