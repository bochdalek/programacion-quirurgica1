<!-- src/views/ForbiddenView.vue -->
<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Acceso Prohibido</h2>
        <p class="text-gray-600 mb-6">
          No tiene permiso para acceder a esta sección. Contacte con el administrador si cree que debería tener acceso.
        </p>
        
        <div class="flex justify-center space-x-4">
          <button @click="volver" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Volver
          </button>
          <router-link to="/" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Ir al Inicio
          </router-link>
        </div>
        
        <p class="mt-8 text-sm text-gray-500">
          Rol actual: {{ userRole ? userRole.name : 'No autenticado' }}
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex'
  
  export default {
    name: 'ForbiddenView',
    computed: {
      ...mapGetters(['userRole'])
    },
    methods: {
      volver() {
        if (window.history.length > 2) {
          this.$router.go(-1)
        } else {
          this.$router.push('/')
        }
      }
    }
  }
  </script>