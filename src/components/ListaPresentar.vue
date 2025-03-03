<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Pacientes para Presentar</h2>
    
    <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
      <h3 class="text-lg font-semibold text-blue-800 mb-2">Medicaciones que requieren suspensión preoperatoria:</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-blue-800">Antiagregantes Plaquetarios</h4>
          <ul class="list-disc pl-5 text-sm">
            <li>Ácido Acetilsalicílico: 5-7 días</li>
            <li>Clopidogrel: 5-7 días</li>
            <li>Prasugrel: 7-10 días</li>
            <li>Ticagrelor: 5 días</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-blue-800">Anticoagulantes Orales</h4>
          <ul class="list-disc pl-5 text-sm">
            <li>Warfarina: 5 días</li>
            <li>Dabigatrán: 2 días</li>
            <li>Rivaroxabán: 2 días</li>
            <li>Apixabán: 2 días</li>
            <li>HBPM: 12 horas</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="overflow-auto">
      <table class="min-w-full bg-white border">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-3 border text-left">Nombre</th>
            <th class="py-2 px-3 border text-left">Edad</th>
            <th class="py-2 px-3 border text-left">Tipo Fractura</th>
            <th class="py-2 px-3 border text-left">Ingreso</th>
            <th class="py-2 px-3 border text-left">Estado</th>
            <th class="py-2 px-3 border text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(paciente, index) in pacientesPresentar" :key="index" class="border-b hover:bg-gray-50">
            <td class="py-2 px-3">{{ paciente.nombre }}</td>
            <td class="py-2 px-3">{{ paciente.edad }}</td>
            <td class="py-2 px-3">
              {{ paciente.tipoFractura }}
              <span v-if="paciente.detallesFractura" class="text-sm text-gray-500 block">
                {{ paciente.detallesFractura }}
              </span>
            </td>
            <td class="py-2 px-3">{{ paciente.fechaIngreso }}</td>
            <td class="py-2 px-3">{{ paciente.estadoClinico }}</td>
            <td class="py-2 px-3 space-x-1">
              <button @click="moverAPendientes(paciente)" class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600">
                A Pendientes
              </button>
              <button @click="abrirModalMedicacion(paciente)" class="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600">
                No Programable
              </button>
              <button @click="marcarOrtopedico(paciente, index)" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600">
                Ortopédico
              </button>
              <button @click="verDetalles(paciente)" class="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">
                Detalles
              </button>
            </td>
          </tr>
          <tr v-if="pacientesPresentar.length === 0">
            <td colspan="6" class="py-4 text-center text-gray-500">No hay pacientes para presentar</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal de detalles de medicación -->
    <div v-if="mostrarModalMedicacion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
        <h3 class="text-xl font-bold mb-4">Seleccionar Medicación</h3>
        
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-blue-800 mb-2">Antiagregantes Plaquetarios:</h4>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center">
                <input type="checkbox" id="modal-aas" v-model="medicacionTemp.aas" class="mr-2">
                <label for="modal-aas">Ácido Acetilsalicílico <span class="text-sm text-red-600">(5-7 días)</span></label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="modal-clopidogrel" v-model="medicacionTemp.clopidogrel" class="mr-2">
                <label for="modal-clopidogrel">Clopidogrel <span class="text-sm text-red-600">(5-7 días)</span></label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="modal-prasugrel" v-model="medicacionTemp.prasugrel" class="mr-2">
                <label for="modal-prasugrel">Prasugrel <span class="text-sm text-red-600">(7-10 días)</span></label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="modal-ticagrelor" v-model="medicacionTemp.ticagrelor" class="mr-2">
                <label for="modal-ticagrelor">Ticagrelor <span class="text-sm text-red-600">(5 días)</span></label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium text-purple-800 mb-2">Anticoagulantes Orales:</h4>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center">
                <input type="checkbox" id="modal-warfarina" v-model="medicacionTemp.warfarina" class="mr-2">
                <label for="modal-warfarina">Warfarina <span class="text-sm text-red-600">(5 días)</span></label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="modal-dabigatran" v-model="medicacionTemp.dabigatran" class="mr-2">
                <label for="modal-dabigatran">Dabigatrán <span class="text-sm text-red-600">(2 días)</span></label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="modal-rivaroxaban" v-model="medicacionTemp.rivaroxaban" class="mr-2">
                <label for="modal-rivaroxaban">Rivaroxabán <span class="text-sm text-red-600">(2 días)</span></label>
              </div>
              <div class="flex items-center">
                <input type="checkbox" id="modal-apixaban" v-model="medicacionTemp.apixaban" class="mr-2">
                <label for="modal-apixaban">Apixabán <span class="text-sm text-red-600">(2 días)</span></label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium text-green-800 mb-2">Otras medicaciones anticoagulantes:</h4>
            <div class="flex items-center">
              <input type="checkbox" id="modal-hbpm" v-model="medicacionTemp.hbpm" class="mr-2">
              <label for="modal-hbpm">Heparina de Bajo Peso Molecular <span class="text-sm text-red-600">(12h)</span></label>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6">
          <button @click="cancelarMedicacion" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="confirmarMedicacion" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ListaPresentar',
  data() {
    return {
      mostrarModalMedicacion: false,
      pacienteSeleccionado: null,
      medicacionTemp: {
        // Antiagregantes
        aas: false,
        clopidogrel: false,
        prasugrel: false,
        ticagrelor: false,
        // Anticoagulantes
        warfarina: false,
        dabigatran: false,
        rivaroxaban: false,
        apixaban: false,
        // Otros
        hbpm: false
      }
    }
  },
  computed: {
    ...mapState(['pacientesPresentar'])
  },
  methods: {
    moverAPendientes(paciente) {
      if (confirm(`¿Confirma mover a ${paciente.nombre} a la lista de pendientes de cirugía programada?`)) {
        console.log("Enviando paciente a pendientes desde presentar:", paciente);
        // Es importante enviar el objeto paciente completo, no solo el ID
        this.$store.dispatch('moverAPendientes', { 
          paciente: paciente, 
          origen: 'presentar' 
        }).then(() => {
          alert(`${paciente.nombre} ha sido movido a la lista de pendientes.`);
        }).catch(error => {
          alert(`Error al mover paciente: ${error.message}`);
        });
      }
    },
    
    abrirModalMedicacion(paciente) {
      this.pacienteSeleccionado = paciente;
      
      // Reiniciar el estado temporal de medicación
      this.medicacionTemp = {
        aas: false,
        clopidogrel: false,
        prasugrel: false,
        ticagrelor: false,
        warfarina: false,
        dabigatran: false,
        rivaroxaban: false,
        apixaban: false,
        hbpm: false
      };
      
      // Si el paciente ya tiene medicación definida, cargarla
      if (paciente.medicacion) {
        Object.keys(this.medicacionTemp).forEach(med => {
          if (paciente.medicacion[med]) {
            this.medicacionTemp[med] = true;
          }
        });
      }
      
      this.mostrarModalMedicacion = true;
    },
    
    cancelarMedicacion() {
      this.mostrarModalMedicacion = false;
      this.pacienteSeleccionado = null;
    },
    
    confirmarMedicacion() {
      if (!this.pacienteSeleccionado) return;
      
      // Verificar si se ha seleccionado alguna medicación
      const algunaMedicacionSeleccionada = Object.values(this.medicacionTemp).some(val => val === true);
      
      if (!algunaMedicacionSeleccionada) {
        alert('Por favor, seleccione al menos una medicación o cancele la operación.');
        return;
      }
      
      // Crear una copia del paciente con la medicación actualizada
      const pacienteActualizado = {
        ...this.pacienteSeleccionado,
        medicacion: { ...this.medicacionTemp }
      };
      
      // Mover a no programables por medicación
      console.log("Enviando paciente a no programables por medicación:", pacienteActualizado);
      this.$store.dispatch('moverANoProgramables', { 
        paciente: pacienteActualizado, 
        tipo: 'medicacion' 
      }).then(() => {
        alert(`${pacienteActualizado.nombre} ha sido movido a la lista de no programables por medicación.`);
      }).catch(error => {
        alert(`Error al mover paciente: ${error.message}`);
      });
      
      this.mostrarModalMedicacion = false;
      this.pacienteSeleccionado = null;
    },
    
    moverANoProgramables(paciente) {
      const motivo = prompt(`Indique el motivo por el que ${paciente.nombre} no es programable:`, 'Medicación');
      
      if (motivo) {
        const tipo = motivo.toLowerCase().includes('medic') ? 'medicacion' : 'partesBlandas';
        this.$store.dispatch('moverANoProgramables', { paciente, tipo });
        alert(`${paciente.nombre} ha sido movido a la lista de no programables.`);
      }
    },
    
    marcarOrtopedico(paciente, index) {
      if (confirm(`¿Confirma que el paciente ${paciente.nombre} recibirá tratamiento ortopédico y no requiere cirugía?`)) {
        // Eliminar el paciente de la lista de presentar
        this.$store.commit('eliminarPacientePresentar', index);
        alert(`${paciente.nombre} ha sido marcado como tratamiento ortopédico y eliminado de la lista.`);
      }
    },
    
    verDetalles(paciente) {
      let detalles = `Nombre: ${paciente.nombre}\nEdad: ${paciente.edad}\nTipo de fractura: ${paciente.tipoFractura}`;
      
      if (paciente.detallesFractura) {
        detalles += `\nDetalles de fractura: ${paciente.detallesFractura}`;
      }
      
      detalles += `\nFecha de ingreso: ${paciente.fechaIngreso}\nEstado clínico: ${paciente.estadoClinico}`;
      
      // Añadir información de medicación
      let medicaciones = [];
      
      if (paciente.medicacion) {
        // Antiagregantes
        if (paciente.medicacion.aas) medicaciones.push("Ácido Acetilsalicílico (5-7 días)");
        if (paciente.medicacion.clopidogrel) medicaciones.push("Clopidogrel (5-7 días)");
        if (paciente.medicacion.prasugrel) medicaciones.push("Prasugrel (7-10 días)");
        if (paciente.medicacion.ticagrelor) medicaciones.push("Ticagrelor (5 días)");
        
        // Anticoagulantes
        if (paciente.medicacion.warfarina) medicaciones.push("Warfarina (5 días)");
        if (paciente.medicacion.dabigatran) medicaciones.push("Dabigatrán (2 días)");
        if (paciente.medicacion.rivaroxaban) medicaciones.push("Rivaroxabán (2 días)");
        if (paciente.medicacion.apixaban) medicaciones.push("Apixabán (2 días)");
        
        // Otros
        if (paciente.medicacion.hbpm) medicaciones.push("HBPM (12h)");
      }
      
      if (medicaciones.length > 0) {
        detalles += `\n\nMedicación: ${medicaciones.join(", ")}`;
      }
      
      alert(detalles);
    }
  }
}
</script>