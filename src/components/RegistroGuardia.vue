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
  
  <div class="flex items-center">
  
  <input type="checkbox" id="aas" v-model="nuevoPaciente.medicacion.aas" class="mr-2">
  
  <label for="aas">AAS (24h)</label>
  
  </div>
  
  <div class="flex items-center">
  
  <input type="checkbox" id="clopidogrel" v-model="nuevoPaciente.medicacion.clopidogrel" class="mr-2">
  
  <label for="clopidogrel">Clopidogrel (5 días)</label>
  
  </div>
  
  <!-- Sección expandida de anticoagulantes -->
  
  <div class="border-t border-gray-200 pt-2 mt-2">
  
  <p class="font-medium mb-1">Anticoagulantes:</p>
  
  <div class="ml-4 space-y-1">
  
  <div class="flex items-center">
  
  <input type="checkbox" id="warfarina" v-model="nuevoPaciente.medicacion.warfarina" class="mr-2">
  
  <label for="warfarina">Warfarina/Sintrom (5 días)</label>
  
  </div>
  
  <div class="flex items-center">
  
  <input type="checkbox" id="hbpm" v-model="nuevoPaciente.medicacion.hbpm" class="mr-2">
  
  <label for="hbpm">HBPM (12h)</label>
  
  </div>
  
  <div class="flex items-center">
  
  <input type="checkbox" id="doac" v-model="nuevoPaciente.medicacion.doac" class="mr-2">
  
  <label for="doac">DOAC (48h)</label>
  
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
  
  <tr v-for="(paciente, index) in pacientesUrgentes" :key="index" class="border-b hover:bg-gray-50">
  
  <td class="py-2 px-3">{{ paciente.nombre }}</td>
  
  <td class="py-2 px-3">
  
  {{ paciente.tipoFractura }}
  
  <span v-if="paciente.detallesFractura" class="text-sm text-gray-500 block">
  
  {{ paciente.detallesFractura }}
  
  </span>
  
  </td>
  
  <td class="py-2 px-3">
  
  <button @click="operarPaciente(paciente, index)" class="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 mr-1">
  
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
  
  <tr v-if="pacientesUrgentes.length === 0">
  
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
  
  aas: false,
  
  clopidogrel: false,
  
  warfarina: false,
  
  hbpm: false,
  
  doac: false
  
  },
  
  urgencia: 'noUrgente'
  
  }
  
  }
  
  },
  
  computed: {
  
  ...mapState(['pacientesUrgentes']),
  
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
  
  if (paciente.urgencia === 'urgente') {
  
  this.$store.commit('agregarPacienteUrgente', paciente);
  
  } else {
  
  this.$store.commit('agregarPacientePresentar', paciente);
  
  }
  
  // Resetear el formulario
  
  this.nuevoPaciente = {
  
  nombre: '',
  
  edad: null,
  
  tipoFractura: '',
  
  detallesFractura: '',
  
  estadoClinico: '',
  
  medicacion: {
  
  aas: false,
  
  clopidogrel: false,
  
  warfarina: false,
  
  hbpm: false,
  
  doac: false
  
  },
  
  urgencia: 'noUrgente'
  
  };
  
  alert('Paciente registrado correctamente');
  
  },
  
  operarPaciente(paciente, index) {
  
  if (confirm(`¿Confirma que va a operar a ${paciente.nombre}?`)) {
  
  // Aquí se implementaría la lógica para registrar la operación
  
  // y posiblemente mover el paciente a otra lista si requiere segunda intervención
  
  alert(`${paciente.nombre} ha sido registrado para cirugía inmediata.`);
  
  // Preguntar si requiere segunda intervención
  
  if (confirm('¿Requiere segunda intervención por mal estado de partes blandas u otros factores?')) {
  
  // Mover a no programables
  
  this.$store.commit('moverANoProgramables', {
  
  paciente: paciente,
  
  tipo: 'partesBlandas'
  
  });
  
  }
  
  // Eliminar de la lista de urgentes
  
  this.$store.commit('eliminarPacienteUrgente', index);
  
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
  
  if (paciente.medicacion.aas) medicaciones.push("AAS (24h)");
  
  if (paciente.medicacion.clopidogrel) medicaciones.push("Clopidogrel (5 días)");
  
  if (paciente.medicacion.warfarina) medicaciones.push("Warfarina/Sintrom (5 días)");
  
  if (paciente.medicacion.hbpm) medicaciones.push("HBPM (12h)");
  
  if (paciente.medicacion.doac) medicaciones.push("DOAC (48h)");
  
  }
  
  if (medicaciones.length > 0) {
  
  detalles += `\n\nMedicación: ${medicaciones.join(", ")}`;
  
  }
  
  alert(detalles);
  
  }
  
  }
  
  }
  
  </script>