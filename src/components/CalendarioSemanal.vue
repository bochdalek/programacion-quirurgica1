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
      <div v-for="(dia, index) in diasSemanaLocal" :key="index" class="bg-gray-50 p-4 rounded-lg border">
        <h3 class="text-lg font-bold mb-3">{{ dia }}</h3>
        
        <div v-if="!calendarioSeguro[index] || !calendarioSeguro[index].manana || calendarioSeguro[index].manana.length === 0" 
             class="text-gray-500 text-sm py-4 text-center">
          No hay pacientes programados
        </div>
        
        <div v-else>
          <!-- Turno mañana -->
          <div v-if="calendarioSeguro[index].manana && calendarioSeguro[index].manana.length > 0">
            <h4 class="font-semibold mb-2 bg-blue-100 p-1 rounded">Turno Mañana</h4>
            
            <div v-for="(quirofano, qIndex) in calendarioSeguro[index].manana" :key="`m-${qIndex}`" 
                 class="mb-3 border rounded p-2 bg-white">
              <div class="font-medium bg-blue-50 p-1 mb-1">Quirófano {{ qIndex + 1 }}</div>
              
              <!-- Verificar si tiene structure de slots -->
              <template v-if="quirofano && quirofano.slots">
                <div v-for="(paciente, pIndex) in quirofano.slots" :key="`slot-${pIndex}`" 
                     class="mb-1 last:mb-0 p-2 border-b last:border-0">
                  <div v-if="paciente">
                    <p class="font-medium">{{ paciente.nombre || 'Paciente sin nombre' }}</p>
                    <p class="text-sm">
                      {{ paciente.tipoFractura || 'Tipo no especificado' }}
                      <span v-if="paciente.detallesFractura" class="text-gray-500">
                        ({{ paciente.detallesFractura }})
                      </span>
                    </p>
                  </div>
                  <div v-else class="text-gray-400 text-sm">
                    Slot disponible
                  </div>
                </div>
              </template>
              <!-- Formato antiguo para compatibilidad -->
              <template v-else-if="quirofano">
                <div class="p-2">
                  <p class="font-medium">{{ quirofano.nombre || 'Paciente sin nombre' }}</p>
                  <p class="text-sm">
                    {{ quirofano.tipoFractura || 'Tipo no especificado' }}
                    <span v-if="quirofano.detallesFractura" class="text-gray-500">
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
          
          <!-- Turno tarde -->
          <div v-if="calendarioSeguro[index].tarde && calendarioSeguro[index].tarde.length > 0">
            <h4 class="font-semibold mb-2 bg-purple-100 p-1 rounded">Turno Tarde</h4>
            
            <div v-for="(quirofano, qIndex) in calendarioSeguro[index].tarde" :key="`t-${qIndex}`" 
                 class="mb-3 border rounded p-2 bg-white">
              <div class="font-medium bg-purple-50 p-1 mb-1">Quirófano {{ qIndex + 1 }}</div>
              
              <!-- Verificar si tiene structure de slots -->
              <template v-if="quirofano && quirofano.slots">
                <div v-for="(paciente, pIndex) in quirofano.slots" :key="`slot-${pIndex}`" 
                     class="mb-1 last:mb-0 p-2 border-b last:border-0">
                  <div v-if="paciente">
                    <p class="font-medium">{{ paciente.nombre || 'Paciente sin nombre' }}</p>
                    <p class="text-sm">
                      {{ paciente.tipoFractura || 'Tipo no especificado' }}
                      <span v-if="paciente.detallesFractura" class="text-gray-500">
                        ({{ paciente.detallesFractura }})
                      </span>
                    </p>
                  </div>
                  <div v-else class="text-gray-400 text-sm">
                    Slot disponible
                  </div>
                </div>
              </template>
              <!-- Formato antiguo para compatibilidad -->
              <template v-else-if="quirofano">
                <div class="p-2">
                  <p class="font-medium">{{ quirofano.nombre || 'Paciente sin nombre' }}</p>
                  <p class="text-sm">
                    {{ quirofano.tipoFractura || 'Tipo no especificado' }}
                    <span v-if="quirofano.detallesFractura" class="text-gray-500">
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
          
          <!-- Mensaje si no hay quirófanos configurados -->
          <div v-if="(!calendarioSeguro[index].manana || calendarioSeguro[index].manana.length === 0) && 
                      (!calendarioSeguro[index].tarde || calendarioSeguro[index].tarde.length === 0)" 
               class="text-gray-500 text-sm py-4 text-center">
            No hay quirófanos configurados para este día
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
      maxRetries: 3,
      diasSemanaLocal: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    }
  },
  computed: {
    ...mapState({
      diasSemana: state => state.calendar?.diasSemana || [],
      configuracion: state => state.calendar?.configuracion || [],
      calendarioSemanalStore: state => state.calendar?.calendarioSemanal || []
    }),
    // Safe version of calendarioSemanal that handles null/undefined values
    calendarioSeguro() {
      // If calendario is not available yet, return an empty array
      if (!this.calendarioSemanalStore || !Array.isArray(this.calendarioSemanalStore)) {
        return Array(7).fill().map(() => ({ manana: [], tarde: [] }));
      }
      
      // Return a secured version that won't cause null/undefined errors
      return this.calendarioSemanalStore.map((dia) => {
        if (!dia) {
          return { manana: [], tarde: [] };
        }
        
        // Asegurar que tiene estructura básica
        return {
          manana: Array.isArray(dia.manana) ? dia.manana : [],
          tarde: Array.isArray(dia.tarde) ? dia.tarde : []
        };
      });
    }
  },
  methods: {
    // Método mejorado para cargar datos con reintentos
    loadData() {
      // Reset the data ready flag
      this.dataReady = false;
      
      // Dispatch action to load calendar data
      this.$store.dispatch('fetchCalendarioSemanal')
        .then(() => {
          console.log("Datos del calendario cargados correctamente");
          this.dataReady = true;
        })
        .catch(error => {
          console.error("Error al cargar datos del calendario:", error);
          
          // Si hay error, intentar cargar datos básicos
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.pow(2, this.retryCount) * 100;
            console.log(`Reintentando en ${delay}ms`);
            
            setTimeout(() => this.loadData(), delay);
          } else {
            console.error("No se pudieron cargar los datos del calendario después de varios intentos");
            // Set data ready anyway to show empty state
            this.dataReady = true;
          }
        });
    }
  },
  mounted() {
    // Start loading data when component is mounted
    this.loadData();
  },
  watch: {
    // Watch for changes in store state to refresh data
    'calendarioSemanalStore': {
      handler(newVal) {
        if (newVal && Array.isArray(newVal)) {
          this.dataReady = true;
        }
      },
      deep: true
    }
  }
}
</script>