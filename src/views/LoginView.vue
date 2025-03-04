<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema de Programación Quirúrgica
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Inicie sesión para acceder al sistema
          </p>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="username" class="sr-only">Usuario</label>
              <input id="username" v-model="form.username" name="username" type="text" required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 
                     placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none 
                     focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                     placeholder="Usuario">
            </div>
            <div>
              <label for="password" class="sr-only">Contraseña</label>
              <input id="password" v-model="form.password" name="password" type="password" required 
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 
                     placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none 
                     focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                     placeholder="Contraseña">
            </div>
          </div>
  
          <div>
            <button type="submit" 
                    :disabled="isLoading"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                    text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <!-- Icono de carga -->
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Iniciar Sesión
            </button>
          </div>
          
          <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {{ error }}
          </div>
  
          <!-- Botón de emergencia para redirección -->
          <div v-if="isAuthenticated" class="mt-4 text-center">
            <p class="text-sm text-gray-600 mb-2">Si ya has iniciado sesión pero sigues en esta página:</p>
            <button type="button" @click="forceRedirect" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Continuar a la aplicación
            </button>
          </div>
          
          <!-- Datos de usuario para demo -->
          <div class="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 class="text-sm font-medium text-blue-800 mb-2">Usuarios de demostración:</h3>
            <div class="text-xs text-gray-700 space-y-1">
              <p><strong>Admin:</strong> usuario = admin, contraseña = admin123</p>
              <p><strong>Programador:</strong> usuario = prog, contraseña = prog123</p>
              <p><strong>Traumatólogo:</strong> usuario = trauma, contraseña = trauma123</p>
              <p><strong>Enfermería:</strong> usuario = enf, contraseña = enf123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoginView',
    data() {
      return {
        form: {
          username: '',
          password: ''
        },
        isLoading: false,
        error: null
      }
    },
    computed: {
      isAuthenticated() {
        return this.$store.getters.isAuthenticated;
      }
    },
    methods: {
      async onSubmit() {
        this.isLoading = true;
        this.error = null;
        
        console.log("Iniciando login con:", this.form.username);
        
        try {
          const result = await this.$store.dispatch('login', this.form);
          console.log("Login exitoso, resultado:", result);
          // No necesitamos redirección aquí ya que se hace en la acción login
        } catch (err) {
          console.error("Error durante login:", err);
          this.error = err.message || 'Error al iniciar sesión';
        } finally {
          this.isLoading = false;
        }
      },
      
      // Método para forzar la redirección manualmente
      forceRedirect() {
        const role = this.$store.getters.currentUser?.role;
        if (role) {
          console.log("Redirección manual iniciada para rol:", role);
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
      }
    },
    // Redireccionar si ya está autenticado
    created() {
      console.log("LoginView creado, verificando autenticación");
      
      // Verificar después de un pequeño retraso para asegurar que el store esté listo
      setTimeout(() => {
        if (this.isAuthenticated) {
          console.log("Usuario ya autenticado, redirigiendo");
          this.forceRedirect();
        }
      }, 100);
    }
  }
  </script>