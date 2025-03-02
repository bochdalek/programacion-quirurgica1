// src/router/index.js
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

// Middleware para comprobar permiso específico
const requirePermission = (permission) => {
  return (to, from, next) => {
    console.log(`Verificando permiso ${permission} para usuario:`, store.getters.currentUser);
    
    // Añadir un pequeño retraso para asegurar que el store está completamente inicializado
    setTimeout(() => {
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
    }, 50);
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
      console.log("Ruta / accedida, redirigiendo según rol");
      const userRole = store.getters.currentUser?.role;
      console.log("Rol de usuario para redirección:", userRole);
      
      // Añadir un pequeño retraso
      setTimeout(() => {
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
      }, 50);
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
  routes
})

// Protección global de rutas con retraso para asegurar sincronización
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters.isAuthenticated;
  
  console.log(`Navegando a ${to.path}, requiere auth: ${requiresAuth}, está autenticado: ${isAuthenticated}`);
  
  // Verificar si estamos autenticados pero intentando acceder a login
  if (isAuthenticated && to.name === 'login') {
    console.log("Usuario autenticado intentando acceder a login, redirigiendo según rol");
    const role = store.getters.currentUser?.role;
    
    // Pequeño retraso para asegurar que el store está listo
    setTimeout(() => {
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
    }, 50);
    return;
  }
  
  if (requiresAuth && !isAuthenticated) {
    console.log("Redirigiendo a login porque requiere autenticación");
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router