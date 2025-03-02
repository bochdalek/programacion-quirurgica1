// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'

console.log("Iniciando aplicación...");

// Configuración de timers para actualizar tiempo de medicación
let medicacionTimer = null;

// Inicializa el estado de autenticación inmediatamente
store.dispatch('initAuth').then(() => {
  console.log("Autenticación inicializada, creando app Vue");
  // Luego crea la instancia de la app
  const app = createApp(App);
  
  // Registrar el router y el store
  app.use(router);
  app.use(store);
  
  // Iniciar temporizador para actualizar tiempos de medicación
  if (store.getters.isAuthenticated) {
    console.log("Usuario autenticado, iniciando timer de medicación");
    medicacionTimer = setInterval(() => {
      // Solo actualizamos si el usuario está autenticado
      if (store.getters.isAuthenticated) {
        store.dispatch('actualizarTiempoMedicacion');
      }
    }, 60000); // 60000 ms = 1 minuto
  }
  
  // Monta la aplicación
  app.mount('#app');
  console.log("Aplicación montada");
}).catch(error => {
  console.error("Error al inicializar autenticación:", error);
});

// Limpieza de timers cuando la app se cierra
window.addEventListener('beforeunload', () => {
  if (medicacionTimer) {
    clearInterval(medicacionTimer);
  }
});