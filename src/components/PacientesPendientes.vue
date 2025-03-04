<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Pendientes de Cirugía Programada</h2>
    
    <div class="mb-4 flex justify-end">
      <button @click="ejecutarAlgoritmo" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Ejecutar Algoritmo de Programación
      </button>
    </div>
    
    <div class="overflow-auto">
      <table class="min-w-full bg-white border">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-3 border text-left">Nombre</th>
            <th class="py-2 px-3 border text-left">Edad</th>
            <th class="py-2 px-3 border text-left">Tipo Fractura</th>
            <th class="py-2 px-3 border text-left">Fecha Ingreso</th>
            <th class="py-2 px-3 border text-left">Prioridad</th>
            <th class="py-2 px-3 border text-left">Estado</th>
            <th class="py-2 px-3 border text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="safePacientesPendientes.length > 0">
            <tr v-for="(paciente, index) in safePacientesPendientes" :key="index" class="border-b hover:bg-gray-50">
              <td class="py-2 px-3">{{ paciente.nombre }}</td>
              <td class="py-2 px-3">{{ paciente.edad }}</td>
              <td class="py-2 px-3">{{ paciente.tipoFractura }}</td>
              <td class="py-2 px-3">{{ paciente.fechaIngreso }}</td>
              <td class="py-2 px-3">{{ index + 1 }}</td>
              <td class="py-2 px-3">{{ paciente.estado }}</td>
              <td class="py-2 px-3 space-x-1">
                <button @click="editarPaciente(paciente, index)" class="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">
                  Editar
                </button>
                <button @click="quitarPaciente(paciente, index)" class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600">
                  Quitar
                </button>
              </td>
            </tr>
          </template>
          <tr v-if="!safePacientesPendientes || safePacientesPendientes.length === 0">
            <td colspan="7" class="py-4 text-center text-gray-500">No hay pacientes pendientes de programación</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PacientesPendientes',
  computed: {
    ...mapState(['pacientesPendientes']),
    // Computed property para manejar de forma segura la posibilidad de que pacientesPendientes sea undefined
    safePacientesPendientes() {
      return this.pacientesPendientes || [];
    }
  },
  methods: {
    ejecutarAlgoritmo() {
      if (this.safePacientesPendientes.length === 0) {
        alert('No hay pacientes pendientes para programar.');
        return;
      }
      
      if (confirm('¿Desea ejecutar el algoritmo de programación? Esto generará el calendario semanal.')) {
        try {
          this.$store.dispatch('ejecutarAlgoritmo');
          alert('Algoritmo ejecutado. El calendario semanal ha sido generado.');
          this.$router.push('/calendario');
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
      }
    },
    editarPaciente(paciente, index) {
      const nuevoEstado = prompt('Ingrese el nuevo estado del paciente:', paciente.estado);
      
      if (nuevoEstado) {
        const pacientesActualizados = [...this.safePacientesPendientes];
        pacientesActualizados[index] = {
          ...paciente,
          estado: nuevoEstado
        };
        
        this.$store.commit('actualizarPacientesPendientes', pacientesActualizados);
        alert(`Estado de ${paciente.nombre} actualizado a: ${nuevoEstado}`);
      }
    },
    quitarPaciente(paciente, index) {
      if (confirm(`¿Está seguro de quitar a ${paciente.nombre} de la lista de pendientes?`)) {
        const pacientesActualizados = [...this.safePacientesPendientes];
        pacientesActualizados.splice(index, 1);
        
        this.$store.commit('actualizarPacientesPendientes', pacientesActualizados);
        alert(`${paciente.nombre} ha sido eliminado de la lista de pendientes.`);
      }
    }
  }
}
</script>