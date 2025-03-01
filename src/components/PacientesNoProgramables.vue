<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Pacientes No Programables</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Lista de no programables por medicación -->
      <div>
        <h3 class="text-lg font-bold mb-3">Restricciones por Medicación</h3>
        <div class="overflow-auto max-h-96">
          <table class="min-w-full bg-white border">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-3 border text-left">Nombre</th>
                <th class="py-2 px-3 border text-left">Medicación</th>
                <th class="py-2 px-3 border text-left">Tiempo Restante</th>
                <th class="py-2 px-3 border text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(paciente, index) in pacientesNoProgMedicacion" :key="index" class="border-b hover:bg-gray-50"
                  :class="{'bg-green-100': paciente.tiempoRestante <= 0}">
                <td class="py-2 px-3">{{ paciente.nombre }}</td>
                <td class="py-2 px-3">{{ paciente.medicacion }}</td>
                <td class="py-2 px-3">
                  {{ formatTiempoRestante(paciente.tiempoRestante) }}
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div class="bg-blue-600 h-2 rounded-full" 
                         :style="`width: ${getTiempoRestanteProgress(paciente)}%`"></div>
                  </div>
                </td>
                <td class="py-2 px-3">
                  <button @click="moverAPendientes(paciente, 'medicacion')" 
                          :disabled="paciente.tiempoRestante > 0" 
                          :class="paciente.tiempoRestante <= 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'" 
                          class="text-white px-2 py-1 rounded text-sm">
                    Mover a Pendientes
                  </button>
                </td>
              </tr>
              <tr v-if="pacientesNoProgMedicacion.length === 0">
                <td colspan="4" class="py-4 text-center text-gray-500">No hay pacientes con restricciones por medicación</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Lista de no programables por segunda cirugía -->
      <div>
        <h3 class="text-lg font-bold mb-3">Segundas Cirugías / Partes Blandas</h3>
        <div class="overflow-auto max-h-96">
          <table class="min-w-full bg-white border">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-3 border text-left">Nombre</th>
                <th class="py-2 px-3 border text-left">Primera Cirugía</th>
                <th class="py-2 px-3 border text-left">Motivo</th>
                <th class="py-2 px-3 border text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(paciente, index) in pacientesNoProgPartesBlandas" :key="index" class="border-b hover:bg-gray-50">
                <td class="py-2 px-3">{{ paciente.nombre }}</td>
                <td class="py-2 px-3">{{ paciente.fechaPrimeraCirugia }}</td>
                <td class="py-2 px-3">{{ paciente.motivo }}</td>
                <td class="py-2 px-3">
                  <button @click="moverAPendientes(paciente, 'partesBlandas')" class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600">
                    Mover a Pendientes
                  </button>
                </td>
              </tr>
              <tr v-if="pacientesNoProgPartesBlandas.length === 0">
                <td colspan="4" class="py-4 text-center text-gray-500">No hay pacientes pendientes de segunda cirugía</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PacientesNoProgramables',
  data() {
    return {
      hourlyTimer: null,
      demoTimer: null
    }
  },
  computed: {
    ...mapState(['pacientesNoProgMedicacion', 'pacientesNoProgPartesBlandas'])
  },
  methods: {
    formatTiempoRestante(horas) {
      if (horas <= 0) return 'Listo para programar';
      
      const dias = Math.floor(horas / 24);
      const horasRestantes = horas % 24;
      
      if (dias > 0) {
        return `${dias} días, ${horasRestantes} horas`;
      }
      return `${horas} horas`;
    },
    getTiempoRestanteProgress(paciente) {
      // Determinar el tiempo total según la medicación
      let tiempoTotal = 24; // Por defecto
      
      if (paciente.medicacion === 'Warfarina/Sintrom' || paciente.medicacion === 'Clopidogrel') {
        tiempoTotal = 120;
      } else if (paciente.medicacion === 'DOAC') {
        tiempoTotal = 48;
      } else if (paciente.medicacion === 'HBPM') {
        tiempoTotal = 12;
      } else if (paciente.medicacion === 'AAS') {
        tiempoTotal = 24;
      }
      
      // Calcular el progreso
      const tiempoTranscurrido = tiempoTotal - paciente.tiempoRestante;
      const porcentaje = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));
      
      return porcentaje;
    },
    moverAPendientes(paciente, origen) {
      if (origen === 'medicacion' && paciente.tiempoRestante > 0) {
        alert(`No se puede programar a ${paciente.nombre} hasta que finalice el tiempo de restricción por medicación.`);
        return;
      }
      
      if (confirm(`¿Confirma que ${paciente.nombre} está listo para ser programado?`)) {
        const origenCommit = origen === 'medicacion' ? 'noProgMedicacion' : 'noProgPartesBlandas';
        this.$store.commit('moverAPendientes', { paciente, origen: origenCommit });
        alert(`${paciente.nombre} ha sido movido a la lista de pendientes de cirugía programada.`);
      }
    }
  },
  // Este ciclo de vida emula la disminución del tiempo de restricción por medicación
  mounted() {
    // Establecer un temporizador que reduce el tiempo restante cada hora
    this.hourlyTimer = setInterval(() => {
      this.pacientesNoProgMedicacion.forEach(paciente => {
        if (paciente.tiempoRestante > 0) {
          paciente.tiempoRestante -= 1;
          
          // Notificar cuando el tiempo llega a cero
          if (paciente.tiempoRestante === 0) {
            alert(`${paciente.nombre} ya ha cumplido el tiempo de restricción por ${paciente.medicacion} y puede ser programado.`);
          }
        }
      });
    }, 3600000); // 3,600,000 ms = 1 hora
    
    // Para demostración, reducir más rápido (cada 10 segundos para probar)
    this.demoTimer = setInterval(() => {
      this.pacientesNoProgMedicacion.forEach(paciente => {
        if (paciente.tiempoRestante > 0) {
          paciente.tiempoRestante -= 1;
        }
      });
    }, 10000); // 10 segundos
  },
  beforeUnmount() {
    // Limpiar temporizadores cuando el componente se destruye
    clearInterval(this.hourlyTimer);
    clearInterval(this.demoTimer);
  }
}
</script>