<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Planificación de Quirófanos</h2>
    <!-- Sección de pacientes pendientes -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-4">Pacientes Pendientes de Programación</h3>
      <div class="overflow-auto max-h-64 mb-4 bg-gray-50 p-2 rounded">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <div v-for="(paciente, index) in pacientesPendientes"
               :key="index"
               class="bg-white p-2 rounded shadow border border-gray-200 cursor-move"
               draggable="true"
               @dragstart="onDragStart($event, paciente, index)">
            <p class="font-medium">{{ paciente.nombre }}</p>
            <p class="text-sm">
              {{ paciente.tipoFractura }}
              <span v-if="paciente.detallesFractura" class="text-gray-500">
                ({{ paciente.detallesFractura }})
              </span>
            </p>
            <p class="text-xs text-gray-500">Ingreso: {{ paciente.fechaIngreso }}</p>
            <div class="flex justify-end mt-1">
              <button @click="editarPaciente(paciente, index)"
                      class="text-blue-500 hover:text-blue-700 text-xs mx-1" title="Editar prioridad, datos o estado del paciente">
                Editar
              </button>
              <button @click="quitarPaciente(paciente, index)"
                      class="text-red-500 hover:text-red-700 text-xs mx-1">
                Quitar
              </button>
            </div>
          </div>
          <div v-if="pacientesPendientes.length === 0" class="col-span-full py-4 text-center text-gray-500">
            No hay pacientes pendientes de programación
          </div>
        </div>
      </div>
      <div class="mb-4 flex justify-end">
        <button @click="ejecutarAlgoritmo" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Programación Automática
        </button>
      </div>
    </div>

    <!-- Sección de calendario -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Calendario Semanal</h3>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div v-for="(dia, diaIndex) in diasSemana" :key="diaIndex"
             class="bg-gray-50 p-4 rounded-lg border">
          <h3 class="text-lg font-bold mb-3">{{ dia }}</h3>
          <!-- Turno de mañana -->
          <div class="mb-4">
            <h4 class="font-semibold mb-2 bg-blue-100 p-1 rounded">Turno Mañana</h4>
            <div v-for="q in getNumQuirofanos(diaIndex, 'manana')" :key="`m-${q}`"
                 class="mb-4 border rounded p-2 bg-white">
              <div class="font-medium bg-blue-50 p-1 mb-2">Quirófano {{ q }}</div>
              <!-- Tres espacios por quirófano -->
              <div class="space-y-2">
                <div v-for="(_, slotIndex) in 3" :key="`slot-${slotIndex}`"
                     class="border border-dashed border-gray-300 rounded p-2"
                     @dragover.prevent
                     @drop="onDrop($event, diaIndex, 'manana', q-1, slotIndex)">
                  <div v-if="getPacienteEnSlot(diaIndex, 'manana', q-1, slotIndex)"
                       class="bg-gray-50 p-2 rounded border">
                    <p class="font-medium">{{ getPacienteEnSlot(diaIndex, 'manana', q-1, slotIndex).nombre }}</p>
                    <p class="text-sm">
                      {{ getPacienteEnSlot(diaIndex, 'manana', q-1, slotIndex).tipoFractura }}
                      <span v-if="getPacienteEnSlot(diaIndex, 'manana', q-1, slotIndex).detallesFractura"
                            class="text-gray-500">
                        ({{ getPacienteEnSlot(diaIndex, 'manana', q-1, slotIndex).detallesFractura }})
                      </span>
                    </p>
                    <button @click="quitarPacienteDeSlot(diaIndex, 'manana', q-1, slotIndex)"
                            class="text-xs text-red-500 hover:text-red-700 mt-1">
                      Quitar
                    </button>
                  </div>
                  <div v-else class="h-12 flex items-center justify-center text-gray-400 italic text-sm">
                    Arrastre un paciente aquí
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Turno de tarde -->
          <div>
            <h4 class="font-semibold mb-2 bg-purple-100 p-1 rounded">Turno Tarde</h4>
            <div v-for="q in getNumQuirofanos(diaIndex, 'tarde')" :key="`t-${q}`"
                 class="mb-4 border rounded p-2 bg-white">
              <div class="font-medium bg-purple-50 p-1 mb-2">Quirófano {{ q }}</div>
              <!-- Tres espacios por quirófano -->
              <div class="space-y-2">
                <div v-for="(_, slotIndex) in 3" :key="`slot-${slotIndex}`"
                     class="border border-dashed border-gray-300 rounded p-2"
                     @dragover.prevent
                     @drop="onDrop($event, diaIndex, 'tarde', q-1, slotIndex)">
                  <div v-if="getPacienteEnSlot(diaIndex, 'tarde', q-1, slotIndex)"
                       class="bg-gray-50 p-2 rounded border">
                    <p class="font-medium">{{ getPacienteEnSlot(diaIndex, 'tarde', q-1, slotIndex).nombre }}</p>
                    <p class="text-sm">
                      {{ getPacienteEnSlot(diaIndex, 'tarde', q-1, slotIndex).tipoFractura }}
                      <span v-if="getPacienteEnSlot(diaIndex, 'tarde', q-1, slotIndex).detallesFractura"
                            class="text-gray-500">
                        ({{ getPacienteEnSlot(diaIndex, 'tarde', q-1, slotIndex).detallesFractura }})
                      </span>
                    </p>
                    <button @click="quitarPacienteDeSlot(diaIndex, 'tarde', q-1, slotIndex)"
                            class="text-xs text-red-500 hover:text-red-700 mt-1">
                      Quitar
                    </button>
                  </div>
                  <div v-else class="h-12 flex items-center justify-center text-gray-400 italic text-sm">
                    Arrastre un paciente aquí
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PlanificacionQuirofanos',
  data() {
    return {
      draggedPaciente: null,
      draggedIndex: null
    }
  },
  computed: {
    ...mapState(['diasSemana', 'configuracion', 'pacientesPendientes', 'calendarioSemanal'])
  },
  methods: {
    getNumQuirofanos(dia, turno) {
      if (!this.configuracion[dia]) return 0;
      return this.configuracion[dia][turno] || 0;
    },
    onDragStart(event, paciente, index) {
      this.draggedPaciente = paciente;
      this.draggedIndex = index;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ paciente, index }));
    },
    onDrop(event, dia, turno, quirofano, slot) {
      event.preventDefault();
      if (!this.draggedPaciente) return;

      // Asignar el paciente al slot específico del quirófano
      this.asignarPacienteASlot(this.draggedPaciente, dia, turno, quirofano, slot);

      // Quitar el paciente de la lista de pendientes
      this.$store.commit('quitarPacientePendiente', this.draggedIndex);

      // Limpiar el estado de arrastre
      this.draggedPaciente = null;
      this.draggedIndex = null;
    },
    asignarPacienteASlot(paciente, dia, turno, quirofano, slot) {
      // Verificar si ya existe el calendario para este día
      if (!this.calendarioSemanal[dia]) {
        this.$store.commit('inicializarDiaCalendario', dia);
      }

      this.$store.commit('asignarPacienteASlot', { dia, turno, quirofano, slot, paciente });
    },
    getPacienteEnSlot(dia, turno, quirofano, slot) {
      if (!this.calendarioSemanal[dia] ||
          !this.calendarioSemanal[dia][turno] ||
          !this.calendarioSemanal[dia][turno][quirofano] ||
          !this.calendarioSemanal[dia][turno][quirofano].slots) {
        return null;
      }

      return this.calendarioSemanal[dia][turno][quirofano].slots[slot];
    },
    quitarPacienteDeSlot(dia, turno, quirofano, slot) {
      if (confirm('¿Está seguro de quitar este paciente del quirófano?')) {
        // Obtener el paciente antes de quitarlo
        const paciente = this.getPacienteEnSlot(dia, turno, quirofano, slot);

        // Quitar el paciente del slot
        this.$store.commit('quitarPacienteDeSlot', { dia, turno, quirofano, slot });

        // Devolver el paciente a la lista de pendientes
        if (paciente) {
          this.$store.commit('agregarPacientePendiente', paciente);
        }
      }
    },
    editarPaciente(paciente, index) {
      // Mostrar un panel más completo de edición con opciones
      const opciones = [
        'Cambiar prioridad',
        'Editar datos clínicos',
        'Cambiar estado',
        'Añadir notas'
      ];

      const opcion = prompt(`Opciones para ${paciente.nombre}:\n1. Cambiar prioridad\n2. Editar datos clínicos\n3. Cambiar estado\n4. Añadir notas\n\nIngrese el número de la opción:`);
      
      if (!opcion) return;
      
      const opcionNum = parseInt(opcion);
      
      switch(opcionNum) {
        case 1: {
          const nuevaPrioridad = prompt('Ingrese la nueva prioridad (1-10, donde 1 es más urgente):', '5');
          if (nuevaPrioridad && !isNaN(parseInt(nuevaPrioridad))) {
            const pacientesActualizados = [...this.pacientesPendientes];
            pacientesActualizados[index] = {
              ...paciente,
              prioridad: parseInt(nuevaPrioridad)
            };
            this.$store.commit('actualizarPacientesPendientes', pacientesActualizados);
            alert(`Prioridad de ${paciente.nombre} actualizada a: ${nuevaPrioridad}`);
          }
          break;
        }
        case 2: {
          const nuevosDatos = prompt('Editar datos clínicos:', paciente.estadoClinico || '');
          if (nuevosDatos) {
            const pacientesActualizados = [...this.pacientesPendientes];
            pacientesActualizados[index] = {
              ...paciente,
              estadoClinico: nuevosDatos
            };
            this.$store.commit('actualizarPacientesPendientes', pacientesActualizados);
            alert(`Datos clínicos de ${paciente.nombre} actualizados`);
          }
          break;
        }
        case 3: {
          const nuevoEstado = prompt('Ingrese el nuevo estado del paciente:', paciente.estado || 'Listo');
          if (nuevoEstado) {
            const pacientesActualizados = [...this.pacientesPendientes];
            pacientesActualizados[index] = {
              ...paciente,
              estado: nuevoEstado
            };
            this.$store.commit('actualizarPacientesPendientes', pacientesActualizados);
            alert(`Estado de ${paciente.nombre} actualizado a: ${nuevoEstado}`);
          }
          break;
        }
        case 4: {
          const nuevasNotas = prompt('Añadir notas adicionales:', paciente.notas || '');
          if (nuevasNotas) {
            const pacientesActualizados = [...this.pacientesPendientes];
            pacientesActualizados[index] = {
              ...paciente,
              notas: nuevasNotas
            };
            this.$store.commit('actualizarPacientesPendientes', pacientesActualizados);
            alert(`Notas añadidas para ${paciente.nombre}`);
          }
          break;
        }
        default:
          alert('Opción no válida');
      }
    },
    quitarPaciente(paciente, index) {
      if (confirm(`¿Está seguro de quitar a ${paciente.nombre} de la lista de pendientes?`)) {
        this.$store.commit('quitarPacientePendiente', index);
        alert(`${paciente.nombre} ha sido eliminado de la lista de pendientes.`);
      }
    },
    ejecutarAlgoritmo() {
      if (this.pacientesPendientes.length === 0) {
        alert('No hay pacientes pendientes para programar.');
        return;
      }

      if (confirm('¿Desea ejecutar el algoritmo de programación automática? Se programarán los pacientes pendientes siguiendo estas reglas:\n\n- Fracturas de cadera en quirófanos de tarde\n- Resto de lesiones en quirófanos de mañana\n- Se conservará el orden de prioridad según ingreso')) {
        this.$store.dispatch('ejecutarAlgoritmo');
        alert('Algoritmo ejecutado. El calendario ha sido actualizado.');
      }
    }
  }
}
</script>