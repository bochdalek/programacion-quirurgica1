<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Registro de Guardia</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Formulario de registro de pacientes -->
      <div class="bg-gray-50 p-4 rounded-lg border">
        <h3 class="text-lg font-bold mb-3">Nuevo Paciente</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block mb-1">Nombre completo:</label>
            <input type="text" v-model="nuevoPaciente.nombre" class="border rounded px-3 py-2 w-full">
          </div>
          
          <div>
            <label class="block mb-1">Edad:</label>
            <input type="number" v-model.number="nuevoPaciente.edad" class="border rounded px-3 py-2 w-full">
          </div>
          
          <div>
            <label class="block mb-1">Tipo de Fractura:</label>
            <select v-model="nuevoPaciente.tipoFractura" class="border rounded px-3 py-2 w-full mb-2">
              <option value="">Seleccionar...</option>
              <option value="Cadera - Pertrocantérea">Cadera - Pertrocantérea</option>
              <option value="Cadera - Subtrocantérea">Cadera - Subtrocantérea</option>
              <option value="Cadera - Subcapital">Cadera - Subcapital</option>
              <option value="Fémur periprotésica">Fémur periprotésica</option>
              <option value="Meseta tibial">Meseta tibial</option>
              <option value="Rótula">Rótula</option>
              <option value="Tibia diafisaria">Tibia diafisaria</option>
              <option value="Pilón tibial">Pilón tibial</option>
              <option value="Radio distal">Radio distal</option>
              <option value="Húmero proximal">Húmero proximal</option>
              <option value="Húmero distal">Húmero distal</option>
              <option value="Otra">Otra</option>
            </select>
            
            <!-- Campo de texto para especificar la fractura si selecciona "Otra" o para detallar -->
            <input
              type="text"
              v-model="nuevoPaciente.detallesFractura"
              class="border rounded px-3 py-2 w-full"
              placeholder="Especifique el tipo de fractura o añada detalles">
          </div>
          
          <div>
            <label class="block mb-1">Estado Clínico:</label>
            <textarea v-model="nuevoPaciente.estadoClinico" class="border rounded px-3 py-2 w-full h-20"></textarea>
          </div>
          
          <div>
            <label class="block mb-1">Medicación Actual:</label>
            <div class="space-y-2">
              <!-- Antiagregantes Plaquetarios -->
              <div class="border-t border-gray-200 pt-2 mt-2">
                <p class="font-medium mb-1 text-blue-600">Antiagregantes Plaquetarios:</p>
                <div class="ml-4 space-y-1">
                  <div class="flex items-center">
                    <input type="checkbox" id="aas" v-model="nuevoPaciente.medicacion.aas" class="mr-2">
                    <label for="aas">Ácido Acetilsalicílico <span class="text-sm text-red-600">(5-7 días)</span></label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" id="clopidogrel" v-model="nuevoPaciente.medicacion.clopidogrel" class="mr-2">
                    <label for="clopidogrel">Clopidogrel <span class="text-sm text-red-600">(5-7 días)</span></label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" id="prasugrel" v-model="nuevoPaciente.medicacion.prasugrel" class="mr-2">
                    <label for="prasugrel">Prasugrel <span class="text-sm text-red-600">(7-10 días)</span></label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" id="ticagrelor" v-model="nuevoPaciente.medicacion.ticagrelor" class="mr-2">
                    <label for="ticagrelor">Ticagrelor <span class="text-sm text-red-600">(5 días)</span></label>
                  </div>
                </div>
              </div>

              <!-- Anticoagulantes Orales -->
              <div class="border-t border-gray-200 pt-2 mt-2">
                <p class="font-medium mb-1 text-purple-600">Anticoagulantes Orales:</p>
                <div class="ml-4 space-y-1">
                  <div class="flex items-center">
                    <input type="checkbox" id="warfarina" v-model="nuevoPaciente.medicacion.warfarina" class="mr-2">
                    <label for="warfarina">Warfarina <span class="text-sm text-red-600">(5 días)</span></label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" id="dabigatran" v-model="nuevoPaciente.medicacion.dabigatran" class="mr-2">
                    <label for="dabigatran">Dabigatrán <span class="text-sm text-red-600">(2 días)</span></label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" id="rivaroxaban" v-model="nuevoPaciente.medicacion.rivaroxaban" class="mr-2">
                    <label for="rivaroxaban">Rivaroxabán <span class="text-sm text-red-600">(2 días)</span></label>
                  </div>
                  <div class="flex items-center">
                    <input type="checkbox" id="apixaban" v-model="nuevoPaciente.medicacion.apixaban" class="mr-2">
                    <label for="apixaban">Apixabán <span class="text-sm text-red-600">(2 días)</span></label>
                  </div>
                </div>
              </div>

              <!-- Heparinas -->
              <div class="border-t border-gray-200 pt-2 mt-2">
                <p class="font-medium mb-1 text-green-600">Otras medicaciones anticoagulantes:</p>
                <div class="ml-4 space-y-1">
                  <div class="flex items-center">
                    <input type="checkbox" id="hbpm" v-model="nuevoPaciente.medicacion.hbpm" class="mr-2">
                    <label for="hbpm">Heparina de Bajo Peso Molecular <span class="text-sm text-red-600">(12h)</span></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block mb-1">Urgencia:</label>
            <div class="flex items-center">
              <input type="radio" id="urgente" v-model="nuevoPaciente.urgencia" value="urgente" class="mr-2">
              <label for="urgente" class="mr-4">Urgente</label>
              <input type="radio" id="noUrgente" v-model="nuevoPaciente.urgencia" value="noUrgente" class="mr-2">
              <label for="noUrgente">No Urgente</label>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button @click="registrarPaciente" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" :disabled="!formularioValido">
              Registrar Paciente
            </button>
          </div>
        </div>
      </div>
      
      <!-- Lista de pacientes urgentes -->
      <div>
        <h3 class="text-lg font-bold mb-3">Pacientes Urgentes</h3>
        <div class="overflow-auto max-h-96">
          <table class="min-w-full bg-white border">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-3 border text-left">Nombre</th>
                <th class="py-2 px-3 border text-left">Tipo</th>
                <th class="py-2 px-3 border text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Agregando v-if para evitar error cuando pacientesUrgentesSeguro es undefined -->
              <template v-if="pacientesUrgentesSeguro.length > 0">
                <tr v-for="(paciente, index) in pacientesUrgentesSeguro" :key="index" class="border-b hover:bg-gray-50">
                  <td class="py-2 px-3">{{ paciente.nombre }}</td>
                  <td class="py-2 px-3">
                    {{ paciente.tipoFractura }}
                    <span v-if="paciente.detallesFractura" class="text-sm text-gray-500 block">
                      {{ paciente.detallesFractura }}
                    </span>
                  </td>
                  <td class="py-2 px-3">
                    <button @click="operarPaciente(paciente)" class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 mr-1">
                      Operar
                    </button>
                    <button @click="marcarOrtopedicoUrgente(paciente, index)" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 mr-1">
                      Ortopédico
                    </button>
                    <button @click="verDetallesPaciente(paciente)" class="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600">
                      Detalles
                    </button>
                  </td>
                </tr>
              </template>
              <tr v-if="!pacientesUrgentesSeguro || pacientesUrgentesSeguro.length === 0">
                <td colspan="3" class="py-4 text-center text-gray-500">No hay pacientes urgentes registrados</td>
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
  name: 'RegistroGuardia',
  data() {
    return {
      nuevoPaciente: {
        nombre: '',
        edad: null,
        tipoFractura: '',
        detallesFractura: '',
        estadoClinico: '',
        medicacion: {
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
        },
        urgencia: 'noUrgente'
      }
    }
  },
  computed: {
    ...mapState(['pacientesUrgentes']),
    // Computed property con safe-check para evitar error de "Cannot read properties of undefined (reading 'length')"
    pacientesUrgentesSeguro() {
      return this.pacientesUrgentes || [];
    },
    formularioValido() {
      return this.nuevoPaciente.nombre &&
             this.nuevoPaciente.edad &&
             this.nuevoPaciente.tipoFractura &&
             this.nuevoPaciente.estadoClinico;
    }
  },
  methods: {
    registrarPaciente() {
      if (!this.formularioValido) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }
      
      // Hacer una copia profunda para evitar problemas de referencia
      const paciente = JSON.parse(JSON.stringify(this.nuevoPaciente));
      
      // Asignar un ID temporal para desarrollo local
      paciente.id = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      if (paciente.urgencia === 'urgente') {
        this.$store.dispatch('addPacienteUrgente', paciente).then(() => {
          // Resetear el formulario
          this.resetearFormulario();
          alert('Paciente urgente registrado correctamente');
        }).catch(error => {
          alert(`Error al registrar paciente: ${error.message}`);
        });
      } else {
        this.$store.dispatch('addPacientePresentar', paciente).then(() => {
          // Resetear el formulario
          this.resetearFormulario();
          alert('Paciente registrado correctamente para presentar');
        }).catch(error => {
          alert(`Error al registrar paciente: ${error.message}`);
        });
      }
    },
    
    // Método para resetear el formulario
    resetearFormulario() {
      this.nuevoPaciente = {
        nombre: '',
        edad: null,
        tipoFractura: '',
        detallesFractura: '',
        estadoClinico: '',
        medicacion: {
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
        },
        urgencia: 'noUrgente'
      };
    },
    
    operarPaciente(paciente) {
      if (confirm(`¿Confirma que va a operar a ${paciente.nombre}?`)) {
        // Implementar la lógica para registrar la operación
        console.log("Operando paciente urgente:", paciente);
        
        // Preguntar si requiere segunda intervención
        const requiereSegunda = confirm('¿Requiere segunda intervención por mal estado de partes blandas u otros factores?');
        
        // Llamar a la acción correspondiente
        this.$store.dispatch('operarPacienteUrgente', {
          paciente: paciente, 
          requiereSegunda: requiereSegunda
        }).then(() => {
          alert(`${paciente.nombre} ha sido ${requiereSegunda ? 'registrado para seguimiento posterior' : 'registrado como operado'}.`);
        }).catch(error => {
          alert(`Error al registrar operación: ${error.message}`);
        });
      }
    },
    
    marcarOrtopedicoUrgente(paciente, index) {
      if (confirm(`¿Confirma que el paciente ${paciente.nombre} recibirá tratamiento ortopédico y no requiere cirugía?`)) {
        // Eliminar de la lista de urgentes
        this.$store.commit('eliminarPacienteUrgente', index);
        alert(`${paciente.nombre} ha sido marcado como tratamiento ortopédico y eliminado de la lista.`);
      }
    },
    
    verDetallesPaciente(paciente) {
      let detalles = `Nombre: ${paciente.nombre}\nEdad: ${paciente.edad}\nTipo de fractura: ${paciente.tipoFractura}`;
      
      if (paciente.detallesFractura) {
        detalles += `\nDetalles de fractura: ${paciente.detallesFractura}`;
      }
      
      detalles += `\nEstado clínico: ${paciente.estadoClinico}`;
      
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