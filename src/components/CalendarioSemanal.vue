<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Calendario Semanal</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
      <div v-for="(dia, index) in diasSemana" :key="index" class="bg-gray-50 p-4 rounded-lg border">
        <h3 class="text-lg font-bold mb-3">{{ dia }}</h3>
        
        <div v-if="!calendarioSemanal[index] || !calendarioSemanal[index].quirofanos || calendarioSemanal[index].quirofanos.length === 0" 
             class="text-gray-500 text-sm py-4 text-center">
          No hay pacientes programados
        </div>
        
        <div v-else>
          <div v-for="(quirofano, qIndex) in calendarioSemanal[index].quirofanos" :key="`q-${qIndex}`" 
               class="mb-3 border rounded p-2 bg-white">
            <div class="font-medium bg-blue-50 p-1 mb-1">Quirófano {{ qIndex + 1 }}</div>
            
            <!-- Verificar si es una entrada simple o un array de pacientes -->
            <template v-if="Array.isArray(quirofano)">
              <div v-for="(paciente, pIndex) in quirofano" :key="`p-${pIndex}`" 
                   class="mb-1 last:mb-0 p-2 border-b last:border-0">
                <p class="font-medium">{{ paciente.nombre }}</p>
                <p class="text-sm">
                  {{ paciente.tipoFractura }}
                  <span v-if="paciente.detallesFractura" class="text-gray-500">
                    ({{ paciente.detallesFractura }})
                  </span>
                </p>
              </div>
            </template>
            <template v-else>
              <div class="p-2">
                <p class="font-medium">{{ quirofano.nombre }}</p>
                <p class="text-sm">
                  {{ quirofano.tipoFractura }}
                  <span v-if="quirofano.detallesFractura" class="text-gray-500">
                    ({{ quirofano.detallesFractura }})
                  </span>
                </p>
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
  computed: {
    ...mapState(['diasSemana', 'configuracion', 'calendarioSemanal'])
  }
}
</script>