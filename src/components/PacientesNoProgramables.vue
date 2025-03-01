<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Pacientes No Programables</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Lista de no programables por medicación -->
      <div>
        <h3 class="text-lg font-bold mb-3">Restricciones por Medicación</h3>
        <div class="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
          <h4 class="font-semibold text-blue-800 mb-2">Tiempos de suspensión preoperatoria:</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <p class="font-medium">Antiagregantes:</p>
              <ul class="ml-4 list-disc">
                <li>Ácido Acetilsalicílico: 5-7 días</li>
                <li>Clopidogrel: 5-7 días</li>
                <li>Prasugrel: 7-10 días</li>
                <li>Ticagrelor: 5 días</li>
              </ul>
            </div>
            <div>
              <p class="font-medium">Anticoagulantes:</p>
              <ul class="ml-4 list-disc">
                <li>Warfarina: 5 días</li>
                <li>Dabigatrán: 2 días</li>
                <li>Rivaroxabán: 2 días</li>
                <li>Apixabán: 2 días</li>
                <li>HBPM: 12 horas</li>
              </ul>
            </div>
          </div>
        </div>
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
                          :class="paciente.tiempoRestante <= 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'" 
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
      
      // Antiagregantes
      if (paciente.medicacion === 'Ácido Acetilsalicílico') {
        tiempoTotal = 144; // 6 días en horas (promedio de 5-7 días)
      } else if (paciente.medicacion === 'Clopidogrel') {
        tiempoTotal = 144; // 6 días en horas
      } else if (paciente.medicacion === 'Prasugrel') {
        tiempoTotal = 204; // 8.5 días en horas (promedio de 7-10 días)
      } else if (paciente.medicacion === 'Ticagrelor') {
        tiempoTotal = 120; // 5 días en horas
      }
      // Anticoagulantes
      else if (paciente.medicacion === 'Warfarina' || paciente.medicacion === 'Warfarina/Sintrom') {
        tiempoTotal = 120; // 5 días en horas
      } else if (paciente.medicacion === 'Dabigatrán' || 
                paciente.medicacion === 'Rivaroxabán' || 
                paciente.medicacion === 'Apixabán' ||
                paciente.medicacion === 'DOAC') {
        tiempoTotal = 48; // 2 días en horas
      }
      // Otros
      else if (paciente.medicacion === 'HBPM') {
        tiempoTotal = 12; // 12 horas
      }
      
      // Calcular el progreso
      const tiempoTranscurrido = tiempoTotal - paciente.tiempoRestante;
      const porcentaje = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));
      
      return porcentaje;
    },
    moverAPendientes(paciente, origen) {
      if (origen === 'medicacion' && paciente.tiempoRestante > 0) {
        const confirmacionAnestesista = confirm(`ADVERTENCIA: ${paciente.nombre} aún no ha completado el tiempo de espera recomendado para ${paciente.medicacion} (${this.formatTiempoRestante(paciente.tiempoRestante)} restantes).\n\n¿Confirma que un anestesista ha autorizado la programación a pesar de la medicación?`);
        
        if (!confirmacionAnestesista) {
          return;
        }
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