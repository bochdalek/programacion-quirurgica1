// src/store/auth.js
import router from '../router'
import { 
  auth, 
  loginWithEmail, 
  logout as firebaseLogout, 
  getUserData, 
  onAuthStateChanged 
} from '../firebase'

// Definición de roles con nombres exactos
const roles = {
  admin: {
    name: 'Administrador',
    permissions: [
      'manage_users', 
      'view_reports', 
      'create_reports',
      'manage_configuration', 
      'manage_calendar', 
      'reset_week',
      'register_patients',
      'present_patients',
      'view_calendar',
      'update_patient_status'
    ]
  },
  programador: {
    name: 'Programador Quirúrgico',
    permissions: [
      'view_configuration',
      'manage_calendar', 
      'view_reports', 
      'view_calendar',
      'update_patient_status'
    ]
  },
  traumatologo: {
    name: 'Traumatólogo',
    permissions: [
      'view_calendar', 
      'register_patients', 
      'present_patients'
    ]
  },
  enfermeria: {
    name: 'Enfermería',
    permissions: [
      'view_calendar', 
      'update_patient_status'
    ]
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
      if (!state.currentUser) return false;
      const userRole = roles[state.currentUser.role];
      if (!userRole) {
        console.error(`Rol no reconocido: ${state.currentUser.role}`);
        return false;
      }
      return userRole.permissions.includes(permission);
    },
    userRole: state => {
      if (!state.currentUser) return null;
      const role = roles[state.currentUser.role];
      if (!role) {
        console.error(`Rol no encontrado en definiciones: ${state.currentUser.role}`);
        return { name: state.currentUser.role, permissions: [] };
      }
      return role;
    }
  },
  
  mutations: {
    setAuth(state, { token, user }) {
      console.log("setAuth llamado con usuario:", user);
      state.token = token;
      state.currentUser = user;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    clearAuth(state) {
      console.log("clearAuth llamado");
      state.token = '';
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  
  actions: {
    // Inicializar el estado de autenticación al cargar la app
    initAuth({ commit }) {
      console.log("initAuth llamado");
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log("Estado de autenticación cambiado:", user ? user.email : "No hay usuario");
          if (user) {
            try {
              const userData = await getUserData(user.uid);
              console.log("Datos de usuario obtenidos:", userData);
              
              if (!userData.role) {
                console.error("El usuario no tiene rol definido:", userData);
                commit('clearAuth');
                resolve();
                return;
              }
              
              const token = await user.getIdToken();
              commit('setAuth', { token, user: userData });
            } catch (error) {
              console.error("Error al obtener datos de usuario:", error);
              commit('clearAuth');
            }
          } else {
            commit('clearAuth');
          }
          resolve();
          unsubscribe();
        });
      });
    },
    
    // Login
    async login({ commit }, { username, password }) {
      console.log("login llamado con username:", username);
      try {
        // Para pruebas, convertimos username a email si no incluye @
        const email = username.includes('@') ? username : `${username}@example.com`;
        console.log("Intentando login con email:", email);
        
        const user = await loginWithEmail(email, password);
        if (user) {
          console.log("Login exitoso para:", user.email);
          const userData = await getUserData(user.uid);
          console.log("Datos de usuario obtenidos tras login:", userData);
          
          if (!userData.role) {
            console.error("El usuario autenticado no tiene rol definido:", userData);
            throw new Error('El usuario no tiene permisos asignados');
          }
          
          const token = await user.getIdToken();
          commit('setAuth', { token, user: userData });
          
          // Redirige según el rol
          this.dispatch('redirectBasedOnRole', userData.role);
          
          return userData;
        }
      } catch (error) {
        console.error("Error en login:", error);
        throw new Error('Usuario o contraseña incorrectos');
      }
    },
    
    // Redirige según el rol
    redirectBasedOnRole(_, role) {
      console.log("redirectBasedOnRole llamado con rol:", role);
      switch(role) {
        case 'admin':
          router.push('/configuracion');
          break;
        case 'programador':
          router.push('/calendario');
          break;
        case 'traumatologo':
          router.push('/guardia');
          break;
        case 'enfermeria':
          router.push('/calendario');
          break;
        default:
          console.warn(`Rol desconocido: ${role}, redirigiendo a login`);
          router.push('/login');
          break;
      }
    },
    
    // Logout
    async logout({ commit }) {
      console.log("logout llamado");
      try {
        await firebaseLogout();
        commit('clearAuth');
        router.push('/login');
      } catch (error) {
        console.error("Error en logout:", error);
        throw error;
      }
    }
  }
}

export default authModule