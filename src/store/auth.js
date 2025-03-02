// src/store/auth.js
import router from '../router'
import { 
  auth, 
  loginWithEmail, 
  logout as firebaseLogout, 
  getUserData, 
  onAuthStateChanged 
} from '../firebase'

// Definición de roles y sus permisos
const roles = {
  admin: {
    name: 'Administrador',
    permissions: ['manage_users', 'view_reports', 'manage_configuration', 'manage_calendar', 'reset_week']
  },
  programador: {
    name: 'Programador Quirúrgico',
    permissions: ['manage_calendar', 'view_reports', 'manage_configuration']
  },
  traumatologo: {
    name: 'Traumatólogo',
    permissions: ['view_calendar', 'register_patients', 'present_patients']
  },
  enfermeria: {
    name: 'Enfermería',
    permissions: ['view_calendar', 'update_patient_status']
  }
}

const authModule = {
  state: {
    currentUser: null,
    isAuthenticated: false,
    token: localStorage.getItem('token') || '',
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.currentUser,
    hasPermission: state => permission => {
      if (!state.currentUser) return false
      const userRole = roles[state.currentUser.role]
      return userRole && userRole.permissions.includes(permission)
    },
    userRole: state => state.currentUser ? roles[state.currentUser.role] : null
  },
  
  mutations: {
    setAuth(state, { token, user }) {
      state.token = token
      state.currentUser = user
      state.isAuthenticated = true
      localStorage.setItem('token', token)
    },
    clearAuth(state) {
      state.token = ''
      state.currentUser = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    }
  },
  
  actions: {
    // Inicializar el estado de autenticación al cargar la app
    initAuth({ commit }) {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userData = await getUserData(user.uid)
              const token = await user.getIdToken()
              commit('setAuth', { token, user: userData })
            } catch (error) {
              console.error("Error al obtener datos de usuario:", error)
              commit('clearAuth')
            }
          } else {
            commit('clearAuth')
          }
          resolve()
          unsubscribe()
        })
      })
    },
    
    // Login
    async login({ commit }, { username, password }) {
      try {
        // Para hacer pruebas fácilmente, convertimos username a email
        // En producción deberías usar emails reales
        const email = username.includes('@') ? username : `${username}@example.com`
        
        const user = await loginWithEmail(email, password)
        if (user) {
          const userData = await getUserData(user.uid)
          const token = await user.getIdToken()
          
          commit('setAuth', { token, user: userData })
          return userData
        }
      } catch (error) {
        console.error("Error en login:", error)
        throw new Error('Usuario o contraseña incorrectos')
      }
    },
    
    // Logout
    async logout({ commit }) {
      try {
        await firebaseLogout()
        commit('clearAuth')
        router.push('/login')
      } catch (error) {
        console.error("Error en logout:", error)
        throw error
      }
    }
  }
}

export default authModule