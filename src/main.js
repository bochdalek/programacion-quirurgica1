// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'

// Configuración de timers para actualizar tiempo de medicación
let medicacionTimer = null;

// Inicializa el estado de autenticación inmediatamente
store.dispatch('initAuth').then(() => {
  // Luego crea la instancia de la app
  const app = createApp(App)

  // Configurar protección de rutas global
  router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const isAuthenticated = store.getters.isAuthenticated
    
    if (requiresAuth && !isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  })
  
  // Registrar componentes globales si necesitas alguno
  // app.component('ComponenteGlobal', ComponenteGlobal)
  
  // Registrar directivas personalizadas si necesitas alguna
  // app.directive('miDirectiva', {...})
  
  // Registrar el router y el store
  app.use(router)
  app.use(store)
  
  // Establecer propiedades globales
  app.config.globalProperties.$formatFecha = (fecha) => {
    if (!fecha) return ''
    
    if (typeof fecha === 'string') {
      fecha = new Date(fecha)
    }
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // Iniciar temporizador para actualizar tiempos de medicación
  // Lo hacemos cada 10 minutos en producción, aquí usamos 1 min para demo
  if (store.getters.isAuthenticated) {
    medicacionTimer = setInterval(() => {
      // Solo actualizamos si el usuario está autenticado
      if (store.getters.isAuthenticated) {
        store.dispatch('actualizarTiempoMedicacion')
      }
    }, 60000) // 60000 ms = 1 minuto
  }
  
  // Cargar datos iniciales si el usuario está autenticado
  if (store.getters.isAuthenticated) {
    store.dispatch('fetchInitialData')
  }
  
  // Monta la aplicación
  app.mount('#app')
})

// Limpieza de timers cuando la app se cierra
window.addEventListener('beforeunload', () => {
  if (medicacionTimer) {
    clearInterval(medicacionTimer)
  }
})