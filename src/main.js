import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './index.css'

// Inicializa el estado de autenticación inmediatamente
store.dispatch('initAuth');

const app = createApp(App)

// Registra el router y el store
app.use(router)
app.use(store)

// Monta la aplicación
app.mount('#app')