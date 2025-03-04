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
    
    <div v-if="diasSemana && diasSemana.length" class="grid grid-cols-1 md:grid-cols-7 gap-4">
      <div v-for="(dia, index) in diasSemana" :key="index" class="bg-gray-50 p-4 rounded-lg border">
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
      Cargando configuración...
    </div>
    
    <div class="flex justify-end mt-4">
      <button @click="guardarConfiguracion" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
      configuracionLocal: []
    }
  },
  computed: {
    ...mapState(['diasSemana', 'configuracion'])
  },
  methods: {
    guardarConfiguracion() {
      if (!this.configuracionLocal || !this.diasSemana || this.configuracionLocal.length === 0) {
        alert('Error: No hay configuración para guardar');
        return;
      }
      
      this.$store.commit('actualizarConfiguracion', JSON.parse(JSON.stringify(this.configuracionLocal)));
      alert('Configuración guardada correctamente');
    },
    
    initializeConfiguration() {
      // Solo inicializar si tenemos los datos necesarios
      if (!this.diasSemana || !this.diasSemana.length) {
        console.log('Esperando datos de diasSemana para inicializar configuración');
        return;
      }
      
      // Inicializar la configuración con valores por defecto o existentes
      this.configuracionLocal = this.diasSemana.map((_, index) => {
        // Si hay configuración existente, usarla
        if (this.configuracion && this.configuracion[index]) {
          return {
            manana: this.configuracion[index].manana || 0,
            tarde: this.configuracion[index].tarde || 0
          };
        }
        // Valores por defecto
        return {
          manana: index < 5 ? 2 : 1, // Lunes a Viernes: 2, Sábado y Domingo: 1
          tarde: index < 5 ? 2 : 1
        };
      });
    }
  },
  created() {
    // No inicializar aquí, esperar a que los datos estén disponibles
  },
  mounted() {
    // Intentar inicializar cuando el componente esté montado
    this.initializeConfiguration();
  },
  watch: {
    // Observar cambios en diasSemana y configuracion para inicializar cuando estén disponibles
    diasSemana: {
      handler(newVal) {
        if (newVal && newVal.length) {
          this.initializeConfiguration();
        }
      },
      immediate: true
    },
    configuracion: {
      handler() {
        // Re-inicializar si cambia la configuración
        this.initializeConfiguration();
      },
      immediate: true
    }
  }
}
</script>