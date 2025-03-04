// src/router/index.js (fixed version)
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Componentes
import LoginView from '../views/LoginView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ConfiguracionSemanal from '../components/ConfiguracionSemanal.vue'
import RegistroGuardia from '../components/RegistroGuardia.vue'
import ListaPresentar from '../components/ListaPresentar.vue'
import PacientesNoProgramables from '../components/PacientesNoProgramables.vue'
import PacientesPendientes from '../components/PacientesPendientes.vue'
import CalendarioSemanal from '../components/CalendarioSemanal.vue'
import InformesEstadisticos from '../components/InformesEstadisticos.vue'
import PlanificacionQuirofanos from '../components/PlanificacionQuirofanos.vue'
import AdministracionSistema from '../components/AdministracionSistema.vue'

// Variable global para asegurar que la autenticación esté completa
let authInitialized = false;

// Mejorado: Middleware para comprobar permiso específico con mejor manejo de auth
const requirePermission = (permission) => {
  return (to, from, next) => {
    // Si la autenticación no se ha completado, esperar brevemente
    if (!authInitialized) {
      console.log(`Esperando inicialización de autenticación para comprobar permiso: ${permission}`);
      
      // Esperar un tiempo prudente para que la autenticación se complete
      setTimeout(() => {
        requirePermission(permission)(to, from, next);
      }, 100);
      
      return;
    }
    
    console.log(`Verificando permiso ${permission} para usuario:`, store.getters.currentUser);
    
    if (!store.getters.isAuthenticated) {
      console.log("Usuario no autenticado, redirigiendo a login");
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else if (!store.getters.hasPermission(permission)) {
      console.log(`Usuario no tiene permiso ${permission}, redirigiendo a forbidden`);
      next({ name: 'forbidden' });
    } else {
      console.log(`Usuario tiene permiso ${permission}, continuando`);
      next();
    }
  };
};

const routes = [
  { 
    path: '/login', 
    name: 'login', 
    component: LoginView,
    meta: { requiresAuth: false }
  },
  { 
    path: '/forbidden',
    name: 'forbidden',
    component: ForbiddenView,
    meta: { requiresAuth: false }
  },
  { 
    path: '/', 
    name: 'home',
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      // Si la autenticación no se ha completado, esperar brevemente
      if (!authInitialized) {
        console.log("Esperando inicialización de autenticación para redirección en ruta '/'");
        
        setTimeout(() => {
          const currentRoute = router.currentRoute.value;
          // Verificar si ya se ha navegado a otra ruta mientras esperábamos
          if (currentRoute.path === '/') {
            router.replace('/'); // Esto provocará que se revalúe esta ruta
          }
        }, 100);
        
        next();
        return;
      }

      console.log("Ruta / accedida, redirigiendo según rol");
      const userRole = store.getters.currentUser?.role;
      console.log("Rol de usuario para redirección:", userRole);
      
      // Redirigir según el rol del usuario
      if (userRole === 'admin') {
        console.log("Redirigiendo a admin a /configuracion");
        next('/configuracion');
      } else if (userRole === 'programador') {
        console.log("Redirigiendo a programador a /calendario");
        next('/calendario');
      } else if (userRole === 'traumatologo') {
        console.log("Redirigiendo a traumatologo a /guardia");
        next('/guardia');
      } else if (userRole === 'enfermeria') {
        console.log("Redirigiendo a enfermeria a /calendario");
        next('/calendario');
      } else {
        console.log("Rol no reconocido, redirigiendo a login");
        next('/login');
      }
    }
  },
  { 
    path: '/configuracion', 
    name: 'configuracion',
    component: ConfiguracionSemanal, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'manage_configuration'
    },
    beforeEnter: requirePermission('manage_configuration')
  },
  { 
    path: '/guardia', 
    name: 'guardia',
    component: RegistroGuardia, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'register_patients'
    },
    beforeEnter: requirePermission('register_patients')
  },
  { 
    path: '/presentar', 
    name: 'presentar',
    component: ListaPresentar, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'present_patients'
    },
    beforeEnter: requirePermission('present_patients')
  },
  { 
    path: '/noprogramables', 
    name: 'noprogramables',
    component: PacientesNoProgramables, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'view_calendar'
    },
    beforeEnter: requirePermission('view_calendar')
  },
  { 
    path: '/pendientes', 
    name: 'pendientes',
    component: PacientesPendientes, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'manage_calendar'
    },
    beforeEnter: requirePermission('manage_calendar')
  },
  { 
    path: '/calendario', 
    name: 'calendario',
    component: CalendarioSemanal, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'view_calendar'
    },
    beforeEnter: requirePermission('view_calendar')
  },
  { 
    path: '/reportes', 
    name: 'reportes',
    component: InformesEstadisticos, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'view_reports'
    },
    beforeEnter: requirePermission('view_reports')
  },
  { 
    path: '/planificacion', 
    name: 'planificacion',
    component: PlanificacionQuirofanos, 
    meta: { 
      requiresAuth: true,
      requiredPermission: 'manage_calendar'
    },
    beforeEnter: requirePermission('manage_calendar')
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdministracionSistema,
    meta: {
      requiresAuth: true,
      requiredPermission: 'reset_week'
    },
    beforeEnter: requirePermission('reset_week')
  },
  // Ruta para manejar rutas no encontradas
  { 
    path: '/:pathMatch(.*)*', 
    name: 'not-found',
    component: NotFoundView,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Evitar navegaciones durante la inicialización
  async scrollBehavior(to, from, savedPosition) {
    // Esperar a que la autenticación esté lista
    if (!authInitialized) {
      await new Promise(resolve => {
        const checkAuth = () => {
          if (authInitialized) {
            resolve();
          } else {
            setTimeout(checkAuth, 50);
          }
        };
        checkAuth();
      });
    }
    
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
})

// Protección global de rutas - Versión mejorada
router.beforeEach(async (to, from, next) => {
  // Si la autenticación no está inicializada y esta no es la primera navegación, esperar
  if (!authInitialized && from.name !== undefined) {
    console.log("Esperando inicialización de autenticación antes de navegar a:", to.path);
    
    // Intentar esperar a que la autenticación esté lista (con timeout de seguridad)
    let attemptCount = 0;
    const maxAttempts = 10;
    
    while (!authInitialized && attemptCount < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attemptCount++;
    }
    
    if (!authInitialized) {
      console.warn("Navegación continuada sin inicialización de autenticación después de esperar");
    }
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated;
  
  console.log(`Navegando a ${to.path}, requiere auth: ${requiresAuth}, está autenticado: ${isAuthenticated}`);
  
  // Verificar si estamos autenticados pero intentando acceder a login
  if (isAuthenticated && to.name === 'login') {
    console.log("Usuario autenticado intentando acceder a login, redirigiendo según rol");
    const role = store.getters.currentUser?.role;
    
    if (role === 'admin') {
      console.log("Redirigiendo admin autenticado desde login a /configuracion");
      next('/configuracion');
    } else if (role === 'programador') {
      console.log("Redirigiendo programador autenticado desde login a /calendario");
      next('/calendario');
    } else if (role === 'traumatologo') {
      console.log("Redirigiendo traumatólogo autenticado desde login a /guardia");
      next('/guardia');
    } else if (role === 'enfermeria') {
      console.log("Redirigiendo enfermería autenticado desde login a /calendario");
      next('/calendario');
    } else {
      next();
    }
    return;
  }
  
  if (requiresAuth && !isAuthenticated) {
    console.log("Redirigiendo a login porque requiere autenticación");
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

// Método para marcar la autenticación como inicializada
// Será llamado desde main.js después de que store.dispatch('initAuth') se complete
router.markAuthInitialized = () => {
  authInitialized = true;
  console.log("Router: Autenticación marcada como inicializada");
};

export default router;