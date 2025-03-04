// src/main.js (fixed version)
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'

// Importar Vuelidate correctamente
import { useVuelidate } from '@vuelidate/core'

// Variable para controlar si la configuración se ha precargado
let configPreloaded = false;

// Inicialización de logging mejorado
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

// Variables para almacenar recursos globales
let app = null;
let medicacionTimer = null;

// Configurar error handler global
const setupGlobalErrorHandler = () => {
  // Evitamos múltiples registros del mismo manejador
  if (window.appErrorHandlerRegistered) return;
  
  window.appErrorHandlerRegistered = true;
  
  window.onerror = function(message, source, lineno, colno, error) {
    console.error(`Error global: ${message} en ${source}:${lineno}:${colno}`, error);
    
    try {
      // Solo notificar si el error no es por componentes desmontados
      if (message.indexOf('parentNode') === -1 && 
          message.indexOf('unmounted') === -1 &&
          message.indexOf('null') === -1) {
        
        // Notificar solo si el store ya está disponible
        if (store && store.state && store.state.app) {
          // Evitar notificaciones duplicadas
          if (store.state.app.error !== message) {
            store.commit('setError', message);
            store.dispatch('notify', {
              message: `Error: ${message}`,
              type: 'error'
            });
          }
        }
      }
    } catch (e) {
      console.error("Error al manejar el error global:", e);
    }
    
    return false; // Permitir el comportamiento por defecto
  };
  
  // Capturar promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesa rechazada no manejada:', event.reason);
    
    try {
      if (store && store.dispatch) {
        store.dispatch('notify', {
          message: `Error asíncrono: ${event.reason?.message || 'Error desconocido'}`,
          type: 'error'
        });
      }
    } catch (e) {
      console.error("Error al notificar una promesa rechazada:", e);
    }
  });
};

// Función para iniciar el temporizador de medicación
const startMedicationTimer = () => {
  // Limpiar timer existente si hay alguno
  if (medicacionTimer) {
    clearInterval(medicacionTimer);
    medicacionTimer = null;
  }
  
  console.log("Iniciando timer de medicación");
  
  // Crear nuevo timer
  medicacionTimer = setInterval(() => {
    // Solo ejecutar si el usuario está autenticado
    if (store.getters.isAuthenticated) {
      store.dispatch('actualizarTiempoMedicacion').catch(error => {
        console.error("Error al actualizar tiempo de medicación:", error);
      });
    }
  }, 60000); // 60000 ms = 1 minuto
};

// Función para precargar configuración y datos esenciales
const preloadConfiguration = async () => {
  if (configPreloaded) return;
  
  try {
    console.log("Precargando configuración...");
    await store.dispatch('fetchConfiguracion');
    configPreloaded = true;
    console.log("Configuración precargada con éxito");
  } catch (error) {
    console.error("Error al precargar configuración:", error);
    // No marcamos como precargado para permitir reintentos
  }
};

// Función para configurar y montar la aplicación
const setupAndMountApp = async () => {
  try {
    console.log("Iniciando aplicación...");
    
    // Configurar logging y error handling
    setupDebugLogging();
    setupGlobalErrorHandler();
    
    // Crear la aplicación Vue 
    app = createApp(App);
    
    // Registrar plugins
    app.use(router);
    app.use(store);
    // Proporcionar useVuelidate a la aplicación
    app.provide('useVuelidate', useVuelidate);
    
    // Directivas personalizadas
    app.directive('focus', {
      mounted(el) {
        el.focus();
      }
    });
    
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
    
    // Exponer el store en window para depuración en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      window.store = store;
    }
    
    // Precargar configuración antes de inicializar autenticación
    await preloadConfiguration();
    
    // Inicializar autenticación antes de montar la app
    console.log("Inicializando autenticación...");
    await store.dispatch('initAuth');
    console.log("Autenticación inicializada correctamente");
    
    // Marcar la autenticación como inicializada en el router
    if (router.markAuthInitialized) {
      router.markAuthInitialized();
    }
    
    // Montar la aplicación
    app.mount('#app');
    console.log("Aplicación montada correctamente");
    
    // Iniciar temporizador para medicación si el usuario está autenticado
    if (store.getters.isAuthenticated) {
      // Retrasar ligeramente para asegurar que la app está montada
      setTimeout(() => {
        startMedicationTimer();
      }, 1000);
    }
    
    // Precarga final de datos de la aplicación
    setTimeout(async () => {
      try {
        if (store.getters.isAuthenticated) {
          await store.dispatch('fetchInitialData');
          console.log("Datos iniciales cargados automáticamente después de montar la aplicación");
        }
      } catch (error) {
        console.error("Error al precargar datos iniciales:", error);
      }
    }, 1500);
  } catch (error) {
    console.error("Error crítico al configurar la aplicación:", error);
    
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
    
    // Intentamos montar la app de todos modos para mostrar la pantalla de error
    try {
      if (app) {
        app.mount('#app');
      }
    } catch (mountError) {
      console.error("No se pudo montar la aplicación:", mountError);
    }
  }
};

// Iniciar la aplicación con reintentos
const startApp = async () => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Intento ${attempts + 1} de iniciar la aplicación...`);
      await setupAndMountApp();
      console.log("Aplicación iniciada correctamente");
      return; // Salir si la app se inició correctamente
    } catch (error) {
      attempts++;
      console.error(`Error en intento ${attempts} de iniciar la aplicación:`, error);
      
      if (attempts < maxAttempts) {
        // Esperar antes del siguiente intento
        console.log(`Reintentando en ${attempts * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempts * 1000));
      } else {
        console.error("No se pudo iniciar la aplicación después de varios intentos");
        
        // Mostrar mensaje de error final
        const errorFinal = document.createElement('div');
        errorFinal.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background-color: rgba(0,0,0,0.1);">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; text-align: center;">
              <h1 style="color: #e53e3e; margin-bottom: 10px;">Error crítico</h1>
              <p>La aplicación no pudo iniciarse después de varios intentos. Por favor, recargue la página o contacte con el administrador.</p>
              <button onclick="location.reload()" style="background: #3182ce; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 15px; cursor: pointer;">
                Reiniciar aplicación
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(errorFinal);
      }
    }
  }
};

// Iniciar la aplicación
startApp();

// Limpieza de timers cuando la app se cierra
window.addEventListener('beforeunload', () => {
  if (medicacionTimer) {
    clearInterval(medicacionTimer);
    medicacionTimer = null;
  }
});