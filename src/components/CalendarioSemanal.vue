<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Calendario Semanal</h2>
    
    <!-- Spinner de carga mientras los datos se preparan -->
    <div v-if="!dataReady" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p class="ml-3 text-gray-700">Cargando calendario...</p>
    </div>
    
    <!-- Contenido del calendario solo cuando esté listo -->
    <div v-else class="grid grid-cols-1 md:grid-cols-7 gap-4">
      <div v-for="(dia, index) in diasSemana" :key="index" class="bg-gray-50 p-4 rounded-lg border">
        <h3 class="text-lg font-bold mb-3">{{ dia }}</h3>
        
        <div v-if="!calendarioSeguro[index] || !calendarioSeguro[index].quirofanos || calendarioSeguro[index].quirofanos.length === 0" 
             class="text-gray-500 text-sm py-4 text-center">
          No hay pacientes programados
        </div>
        
        <div v-else>
          <div v-for="(quirofano, qIndex) in calendarioSeguro[index].quirofanos" :key="`q-${qIndex}`" 
               class="mb-3 border rounded p-2 bg-white">
            <div class="font-medium bg-blue-50 p-1 mb-1">Quirófano {{ qIndex + 1 }}</div>
            
            <!-- Verificar si es una entrada simple o un array de pacientes -->
            <template v-if="Array.isArray(quirofano)">
              <div v-for="(paciente, pIndex) in quirofano" :key="`p-${pIndex}`" 
                   class="mb-1 last:mb-0 p-2 border-b last:border-0">
                <p class="font-medium">{{ paciente?.nombre || 'Paciente sin nombre' }}</p>
                <p class="text-sm">
                  {{ paciente?.tipoFractura || 'Tipo no especificado' }}
                  <span v-if="paciente?.detallesFractura" class="text-gray-500">
                    ({{ paciente.detallesFractura }})
                  </span>
                </p>
              </div>
            </template>
            <template v-else-if="quirofano">
              <div class="p-2">
                <p class="font-medium">{{ quirofano?.nombre || 'Paciente sin nombre' }}</p>
                <p class="text-sm">
                  {{ quirofano?.tipoFractura || 'Tipo no especificado' }}
                  <span v-if="quirofano?.detallesFractura" class="text-gray-500">
                    ({{ quirofano.detallesFractura }})
                  </span>
                </p>
              </div>
            </template>
            <template v-else>
              <div class="text-gray-500 text-sm py-2 text-center">
                Quirófano sin asignaciones
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CalendarioSemanal',
  data() {
    return {
      dataReady: false,
      retryCount: 0,
      maxRetries: 3
    }
  },
  computed: {
    ...mapState(['diasSemana', 'configuracion']),
    // Safe version of calendarioSemanal that handles null/undefined values
    calendarioSeguro() {
      const calendario = this.$store.state.calendarioSemanal;
      
      // If calendario is not available yet, return an empty array
      if (!calendario || !Array.isArray(calendario)) {
        return [];
      }
      
      // Return a secured version that won't cause null/undefined errors
      return calendario.map(dia => {
        if (!dia) {
          return { quirofanos: [] };
        }
        
        // Check if the day has quirofanos property
        if (!dia.quirofanos) {
          return { 
            ...dia,
            quirofanos: []
          };
        }
        
        return dia;
      });
    }
  },
  methods: {
    // Método para cargar datos con reintentos
    loadData() {
      // Reset the data ready flag
      this.dataReady = false;
      
      // Check if data is already available
      if (
        this.diasSemana && 
        this.diasSemana.length && 
        this.$store.state.calendarioSemanal
      ) {
        console.log("Datos del calendario disponibles inmediatamente");
        this.dataReady = true;
        return;
      }
      
      // Try to load data with exponential backoff
      const attemptLoad = () => {
        this.retryCount++;
        
        console.log(`Intento ${this.retryCount} de cargar datos del calendario`);
        
        if (
          this.diasSemana && 
          this.diasSemana.length && 
          this.$store.state.calendarioSemanal
        ) {
          console.log("Datos del calendario cargados correctamente");
          this.dataReady = true;
        } else if (this.retryCount < this.maxRetries) {
          // Retry with exponential backoff
          const delay = Math.pow(2, this.retryCount) * 100;
          console.log(`Reintentando en ${delay}ms`);
          
          setTimeout(attemptLoad, delay);
        } else {
          console.error("No se pudieron cargar los datos del calendario después de varios intentos");
          // Set data ready anyway to show empty state
          this.dataReady = true;
        }
      };
      
      // Start the first attempt
      attemptLoad();
    }
  },
  mounted() {
    // Start loading data when component is mounted
    this.loadData();
  },
  watch: {
    // Watch for changes in store state to refresh data
    '$store.state.calendarioSemanal': {
      handler() {
        this.dataReady = true;
      }
    }
  }
}
</script>