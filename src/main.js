// src/main.js (actualizado)
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'

// Importar Vuelidate
import { vuelidate } from '@vuelidate/core'

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
    
    // Interceptar console.warn para añadir timestamp y estilo
    const originalWarn = console.warn;
    console.warn = function() {
      const timestamp = new Date().toISOString().substr(11, 8);
      const args = Array.from(arguments);
      originalWarn.apply(console, [`[${timestamp}] ⚠️ WARN:`, ...args]);
    };
    
    console.log("🔍 Sistema de depuración inicializado");
  }
};

// Error handler global
const setupGlobalErrorHandler = () => {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error(`Error global: ${message} en ${source}:${lineno}:${colno}`, error);
    
    // Evitar notificaciones duplicadas
    if (store.state.app.error !== message) {
      store.commit('setError', message);
      store.dispatch('notify', {
        message: `Error: ${message}`,
        type: 'error'
      });
    }
    
    return false; // Permitir el comportamiento por defecto
  };
  
  // Capturar promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesa rechazada no manejada:', event.reason);
    
    store.dispatch('notify', {
      message: `Error asíncrono: ${event.reason.message || 'Error desconocido'}`,
      type: 'error'
    });
  });
};

// Configurar logging mejorado
setupDebugLogging();

console.log("Iniciando aplicación...");

// Configurar manejador de errores global
setupGlobalErrorHandler();

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
  app.use(vuelidate);
  
  // Directiva para focus en elementos
  app.directive('focus', {
    mounted(el) {
      el.focus();
    }
  });
  
  // Directiva para click-fuera
  app.directive('click-outside', {
    mounted(el, binding) {
      el.clickOutsideEvent = function(event) {
        if (!(el === event.target || el.contains(event.target))) {
          binding.value(event);
        }
      };
      document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
      document.body.removeEventListener('click', el.clickOutsideEvent);
    }
  });
  
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
  
  // Mostrar error de inicialización
  const errorElement = document.createElement('div');
  errorElement.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.1);">
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; text-align: center;">
        <h1 style="color: #e53e3e; margin-bottom: 10px;">Error de inicialización</h1>
        <p>No se pudo inicializar la aplicación. Por favor, intente nuevamente o contacte al administrador.</p>
        <p style="color: #666; font-size: 0.8rem; margin-top: 10px;">${error.message}</p>
        <button onclick="location.reload()" style="background: #3182ce; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 15px; cursor: pointer;">
          Reintentar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(errorElement);
});

// Limpieza de timers cuando la app se cierra
window.addEventListener('beforeunload', () => {
  if (medicacionTimer) {
    clearInterval(medicacionTimer);
  }
});