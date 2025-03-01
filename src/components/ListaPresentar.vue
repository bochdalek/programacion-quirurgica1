<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Pacientes para Presentar</h2>
    
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
              <button @click="moverANoProgramables(paciente)" class="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600">
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
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'ListaPresentar',
  computed: {
    ...mapState(['pacientesPresentar'])
  },
  methods: {
    moverAPendientes(paciente) {
      if (confirm(`¿Confirma mover a ${paciente.nombre} a la lista de pendientes de cirugía programada?`)) {
        this.$store.commit('moverAPendientes', { paciente, origen: 'presentar' });
        alert(`${paciente.nombre} ha sido movido a la lista de pendientes.`);
      }
    },
    moverANoProgramables(paciente) {
      const motivo = prompt(`Indique el motivo por el que ${paciente.nombre} no es programable:`, 'Medicación');
      
      if (motivo) {
        const tipo = motivo.toLowerCase().includes('medic') ? 'medicacion' : 'partesBlandas';
        this.$store.commit('moverANoProgramables', { paciente, tipo });
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
      
      alert(detalles);
    }
  }
}
</script>