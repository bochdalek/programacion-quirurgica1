<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sistema de notificaciones solo cuando la app esté lista -->
    <NotificationsManager v-if="appMounted" />
    
    <!-- Contenedor principal con mejor manejo de estado -->
    <template v-if="appMounted">
      <div class="container mx-auto px-4 py-8">
        <!-- Barra de navegación condicional -->
        <nav v-if="isAuthenticated" class="bg-blue-600 text-white rounded-lg mb-6 shadow-lg">
          <div class="container mx-auto px-6 py-3">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
              <div class="flex items-center justify-between mb-3 md:mb-0">
                <div class="text-xl font-bold">
                  Sistema de Programación Quirúrgica
                </div>
                <div class="md:hidden">
                  <button @click="menuAbierto = !menuAbierto" class="text-white focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path v-if="menuAbierto" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div :class="menuAbierto ? 'block' : 'hidden'" class="md:flex md:flex-row md:items-center flex-wrap gap-2">
                <router-link v-if="hasPermission('manage_configuration')" to="/configuracion" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  Configuración
                </router-link>
                <router-link v-if="hasPermission('register_patients')" to="/guardia" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  Guardia
                </router-link>
                <router-link v-if="hasPermission('present_patients')" to="/presentar" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  Presentar
                </router-link>
                <router-link v-if="hasPermission('view_calendar')" to="/noprogramables" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  No Programables
                </router-link>
                <router-link v-if="hasPermission('manage_calendar')" to="/planificacion" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  Planificación
                </router-link>
                <router-link v-if="hasPermission('view_calendar')" to="/calendario" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  Calendario
                </router-link>
                <router-link v-if="hasPermission('view_reports')" to="/reportes" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  Informes
                </router-link>
                <router-link v-if="hasPermission('reset_week')" to="/admin" class="hover:bg-blue-700 px-3 py-2 rounded block" active-class="bg-blue-800">
                  Administración
                </router-link>
                
                <div class="block md:ml-4 border-t md:border-t-0 md:border-l border-blue-500 pt-2 md:pt-0 md:pl-4 mt-2 md:mt-0">
                  <span class="text-sm md:mr-2">{{ currentUser ? currentUser.name : '' }} ({{ userRole ? userRole.name : '' }})</span>
                  <button @click="logout" class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded">
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <!-- Mensajes de error globales -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {{ error }}
          <button @click="dismissError" class="float-right text-red-700 hover:text-red-900">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Contenido principal -->
        <div class="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div v-if="isAuthenticated && isLoading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p class="ml-3 text-gray-700">Cargando datos...</p>
          </div>
          
          <!-- El router-view solo se renderiza cuando la app está lista -->
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>
        
        <!-- Pie de página -->
        <footer v-if="isAuthenticated" class="mt-8 text-center text-gray-500 text-sm">
          <p>Sistema de Programación Quirúrgica &copy; {{ currentYear }}</p>
        </footer>
      </div>
    </template>
    
    <!-- Loading inicial mientras se prepara la app - Simplificado -->
    <div v-if="!appMounted" class="fixed inset-0 flex items-center justify-center bg-white">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-lg text-gray-700">Inicializando aplicación...</p>
      </div>
    </div>

    <!-- Botón de emergencia cuando el usuario está autenticado pero sigue en login -->
    <div v-if="isAuthenticated && $route && $route.path === '/login'" class="fixed bottom-5 right-5 z-50">
      <button @click="redirectToCorrectPage" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg">
        Forzar navegación
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import NotificationsManager from './components/NotificationsManager.vue'

export default {
  name: 'AppPrincipal',
  components: {
    NotificationsManager
  },
  data() {
    return {
      menuAbierto: false,
      dataLoaded: false,
      currentYear: new Date().getFullYear(),
      appMounted: false // Flag to control when components should be rendered
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.app?.isLoading || false, 
      error: state => state.app?.error || null
    }),
    ...mapGetters(['isAuthenticated', 'currentUser', 'hasPermission', 'userRole'])
  },
  methods: {
    logout() {
      if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        this.$store.dispatch('logout');
      }
    },
    loadInitialData() {
      console.log("Intentando cargar datos iniciales. Autenticado:", this.isAuthenticated, "Ruta:", this.$route?.name);
      
      if (this.isAuthenticated && !this.dataLoaded && this.$route?.name !== 'forbidden') {
        console.log("Cargando datos iniciales...");
        this.$store.dispatch('fetchInitialData')
          .then(() => {
            console.log("Datos iniciales cargados con éxito");
            this.dataLoaded = true;
          })
          .catch(error => {
            console.error("Error al cargar datos iniciales:", error);
          });
      }
    },
    
    // Método para forzar la redirección
    redirectToCorrectPage() {
      const role = this.currentUser?.role;
      if (role) {
        console.log("Forzando redirección para rol:", role);
        switch(role) {
          case 'admin':
            this.$router.push('/configuracion');
            break;
          case 'programador':
            this.$router.push('/calendario');
            break;
          case 'traumatologo':
            this.$router.push('/guardia');
            break;
          case 'enfermeria':
            this.$router.push('/calendario');
            break;
          default:
            this.$router.push('/');
        }
      }
    },
    
    // Descartar mensaje de error
    dismissError() {
      this.$store.commit('setError', null);
    }
  },
  watch: {
    // Cerrar el menú cuando cambie la ruta
    '$route'() {
      this.menuAbierto = false;
    },
    // Cargar datos cuando el usuario esté autenticado o cambie de ruta
    isAuthenticated(newValue) {
      console.log("Estado de autenticación cambiado:", newValue);
      if (newValue) {
        this.loadInitialData();
      }
    },
    '$route.name'() {
      if (this.appMounted) {
        this.loadInitialData();
      }
    }
  },
  created() {
    console.log("App.vue creado. Estado de autenticación:", this.isAuthenticated);
  },
  mounted() {
    // Utilizamos nextTick para asegurar que el DOM está listo
    this.$nextTick(() => {
      // Solución para el problema de timing: establecer un timeout más largo
      setTimeout(() => {
        this.appMounted = true;
        // Esperar un poco más antes de intentar cargar datos
        setTimeout(() => {
          this.loadInitialData();
        }, 100);
      }, 300);
    });
  }
}
</script>

<style>
/* Estilos globales */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Animaciones para las páginas */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>