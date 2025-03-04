// src/components/ConfiguracionSemanal.vue - Fixed version
<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Configuración Semanal de Quirófanos</h2>
    
    <div class="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
      <p class="text-yellow-800">
        <strong>Nota sobre quirófanos de tarde:</strong> El algoritmo de programación para fracturas de cadera se aplicará exclusivamente en los quirófanos de tarde, siguiendo estas reglas:
      </p>
      <ul class="list-disc pl-5 mt-2 text-yellow-800">
        <li>1 fractura subcapital por quirófano, o</li>
        <li>2 fracturas pertrocantéreas por quirófano, o</li>
        <li>1 fractura subtrocantérea por quirófano</li>
      </ul>
    </div>
    
    <div v-if="configuracionInicializada" class="grid grid-cols-1 md:grid-cols-7 gap-4">
      <div v-for="(dia, index) in diasSemanaLocal" :key="index" class="bg-gray-50 p-4 rounded-lg border">
        <h3 class="text-lg font-bold mb-3">{{ dia }}</h3>
        
        <div class="mb-4">
          <h4 class="font-semibold mb-2 bg-blue-100 p-1 rounded">Turno Mañana</h4>
          <div class="flex items-center">
            <label class="mr-2">Quirófanos:</label>
            <input type="number" v-model.number="configuracionLocal[index].manana" min="0" class="border rounded px-2 py-1 w-16">
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold mb-2 bg-purple-100 p-1 rounded">Turno Tarde</h4>
          <div class="flex items-center">
            <label class="mr-2">Quirófanos:</label>
            <input type="number" v-model.number="configuracionLocal[index].tarde" min="0" class="border rounded px-2 py-1 w-16">
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="bg-gray-100 p-4 rounded text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Cargando configuración...</p>
    </div>
    
    <div class="flex justify-end mt-4">
      <button @click="guardarConfiguracion" :disabled="!configuracionInicializada" 
              :class="configuracionInicializada ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'"
              class="text-white px-4 py-2 rounded">
        Guardar Configuración
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ConfiguracionSemanal',
  data() {
    return {
      configuracionLocal: [],
      diasSemanaLocal: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      configuracionInicializada: false,
      initializationAttempts: 0,
      maxAttempts: 5
    }
  },
  computed: {
    ...mapState(['diasSemana', 'configuracion'])
  },
  methods: {
    guardarConfiguracion() {
      if (!this.configuracionInicializada) {
        alert('Error: No hay configuración para guardar');
        return;
      }
      
      try {
        this.$store.commit('actualizarConfiguracion', JSON.parse(JSON.stringify(this.configuracionLocal)));
        alert('Configuración guardada correctamente');
      } catch (error) {
        console.error("Error al guardar configuración:", error);
        alert(`Error al guardar configuración: ${error.message || 'Error desconocido'}`);
      }
    },
    
    // Método para inicializar la configuración
    initializeConfiguration() {
      console.log("Intentando inicializar configuración. Intento:", this.initializationAttempts + 1);
      
      // Verificar si tenemos acceso a los datos de configuración
      if (this.configuracion && Array.isArray(this.configuracion) && this.configuracion.length > 0) {
        // Inicializar la configuración con los valores existentes
        this.configuracionLocal = this.configuracion.map(config => ({
          manana: config.manana || 0,
          tarde: config.tarde || 0
        }));
        
        this.configuracionInicializada = true;
        console.log("Configuración inicializada correctamente a partir de datos existentes");
        return true;
      }
      
      // Si no hay datos de configuración, usar valores por defecto
      if (this.initializationAttempts >= this.maxAttempts) {
        console.log("Se alcanzó el máximo de intentos, inicializando con valores por defecto");
        
        // Inicializar con valores por defecto
        this.configuracionLocal = this.diasSemanaLocal.map((_, index) => ({
          manana: index < 5 ? 2 : 1, // Lunes a Viernes: 2, Sábado y Domingo: 1
          tarde: index < 5 ? 2 : 1
        }));
        
        this.configuracionInicializada = true;
        console.log("Configuración inicializada con valores por defecto");
        return true;
      }
      
      this.initializationAttempts++;
      return false;
    },
    
    // Método de inicialización con reintento
    attemptInitialization() {
      if (!this.initializeConfiguration()) {
        // Si no se pudo inicializar, intentar de nuevo después de un retraso
        setTimeout(() => {
          this.attemptInitialization();
        }, 500 * Math.pow(2, this.initializationAttempts)); // Retraso exponencial
      }
    }
  },
  created() {
    // Al crear el componente, intentar inicializar la configuración
    this.attemptInitialization();
  },
  watch: {
    // Observar cambios en la configuración del store
    configuracion: {
      handler(newConfig) {
        if (newConfig && Array.isArray(newConfig) && newConfig.length > 0 && !this.configuracionInicializada) {
          this.initializeConfiguration();
        }
      },
      immediate: true
    }
  }
}
</script>