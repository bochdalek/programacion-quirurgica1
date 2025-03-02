<!-- src/views/NotFoundView.vue -->
<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Página No Encontrada</h2>
        <p class="text-gray-600 mb-6">
          La página que está buscando no existe o ha sido movida.
        </p>
        
        <div class="flex justify-center space-x-4">
          <button @click="volver" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Volver
          </button>
          <router-link to="/" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Ir al Inicio
          </router-link>
        </div>
        
        <p class="mt-6 text-sm text-gray-500">
          Error 404: Página no encontrada
        </p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NotFoundView',
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