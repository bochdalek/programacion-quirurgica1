<template>
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Barra de navegación principal -->
      <nav class="bg-blue-600 text-white rounded-lg mb-6 shadow-lg">
        <div class="container mx-auto px-6 py-3">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="text-xl font-bold mb-3 md:mb-0">
              Sistema de Programación Quirúrgica
            </div>
            <div class="flex flex-wrap gap-2">
              <router-link to="/configuracion" class="hover:bg-blue-700 px-3 py-2 rounded" active-class="bg-blue-800">
                Configuración
              </router-link>
              <router-link to="/guardia" class="hover:bg-blue-700 px-3 py-2 rounded" active-class="bg-blue-800">
                Guardia
              </router-link>
              <router-link to="/presentar" class="hover:bg-blue-700 px-3 py-2 rounded" active-class="bg-blue-800">
                Presentar
              </router-link>
              <router-link to="/noprogramables" class="hover:bg-blue-700 px-3 py-2 rounded" active-class="bg-blue-800">
                No Programables
              </router-link>
              <router-link to="/planificacion" class="hover:bg-blue-700 px-3 py-2 rounded" active-class="bg-blue-800">
                Planificación
              </router-link>
              <router-link to="/reportes" class="hover:bg-blue-700 px-3 py-2 rounded" active-class="bg-blue-800">
                Informes
              </router-link>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido principal basado en la ruta -->
      <div class="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <router-view></router-view>
      </div>
      
      <!-- Pie de página -->
      <footer class="mt-8 text-center text-gray-500 text-sm">
        <p>Sistema de Programación Quirúrgica &copy; 2025</p>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppPrincipal'
}
</script>