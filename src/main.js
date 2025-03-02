// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'

// Configuración de logging mejorado
const setupDebugLogging = () => {
  // Solo aplica en ambiente de desarrollo
  if (process.env.NODE_ENV !== 'production') {
    // Interceptar console.log para añadir timestamp
    const originalLog = console.log;
    console.log = function() {
      const timestamp = new Date().toISOString().substr(11, 8); // HH:MM:SS
      const args = Array.from(arguments);
      originalLog.apply(console, [`[${timestamp}]`, ...args]);
    };
    
    // Interceptar console.error para añadir timestamp y estilo
    const originalError = console.error;
    console.error = function() {
      const timestamp = new Date().toISOString().substr(11, 8);
      const args = Array.from(arguments);
      originalError.apply(console, [`[${timestamp}] ❌ ERROR:`, ...args]);
    };
    
    console.log("🔍 Sistema de depuración inicializado");
  }
};

// Configurar logging mejorado
setupDebugLogging();

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
  
  // Exponer el store en window para depuración
  if (process.env.NODE_ENV !== 'production') {
    window.store = store;
  }
  
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
  
  // Retraso adicional para verificar redirección después de montaje
  setTimeout(() => {
    if (store.getters.isAuthenticated && router.currentRoute.value.name === 'login') {
      console.log("Detección post-montaje: Usuario autenticado en login, forzando redirección");
      const role = store.getters.currentUser?.role;
      if (role) {
        store.dispatch('redirectBasedOnRole', role);
      }
    }
  }, 500);
}).catch(error => {
  console.error("Error al inicializar autenticación:", error);
});

// Limpieza de timers cuando la app se cierra
window.addEventListener('beforeunload', () => {
  if (medicacionTimer) {
    clearInterval(medicacionTimer);
  }
});