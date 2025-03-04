<!-- src/components/AdministracionSistema.vue -->
<template>
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Administración del Sistema</h2>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Gestión de Ciclo Semanal</h3>
        
        <div class="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
          <p class="text-blue-800">
            <strong>Información importante:</strong> Al resetear la semana, todos los pacientes programados serán movidos al historial y el calendario será reiniciado. Esta acción no puede deshacerse.
          </p>
        </div>
        
        <div class="mb-6">
          <p class="mb-2">Semana actual: <strong>{{ obtenerSemanaActual() }}</strong></p>
          <p>Pacientes programados: <strong>{{ totalProgramados }}</strong></p>
        </div>
        
        <div class="flex space-x-4">
          <button @click="mostrarConfirmacion = true" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Iniciar Nueva Semana
          </button>
          <button @click="exportarHistorico" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Exportar Histórico
          </button>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Copia de Seguridad</h3>
        
        <div class="mb-6">
          <p>Última copia: <strong>{{ ultimaCopia || 'Nunca' }}</strong></p>
        </div>
        
        <div class="flex space-x-4">
          <button @click="generarCopiaSeguridad" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Crear Copia de Seguridad
          </button>
          <button @click="mostrarRestauracion = true" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
            Restaurar Copia
          </button>
        </div>
      </div>
      
      <!-- Modal de confirmación para resetear semana -->
      <div v-if="mostrarConfirmacion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h3 class="text-xl font-bold mb-4 text-red-600">¡Atención! Esta acción no puede deshacerse</h3>
          <p class="mb-6">
            Está a punto de finalizar la semana actual. Todos los pacientes programados serán movidos al histórico y el calendario semanal será reiniciado.
          </p>
          <div class="mb-4">
            <label class="block mb-2">Escriba "CONFIRMAR" para continuar:</label>
            <input 
              type="text" 
              v-model="textoConfirmacion" 
              class="border rounded px-3 py-2 w-full"
              placeholder="CONFIRMAR"
            >
          </div>
          <div class="flex justify-end space-x-3">
            <button @click="mostrarConfirmacion = false" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancelar
            </button>
            <button 
              @click="resetearSemana" 
              :disabled="textoConfirmacion !== 'CONFIRMAR'" 
              :class="textoConfirmacion === 'CONFIRMAR' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'"
              class="px-4 py-2 text-white rounded">
              Iniciar Nueva Semana
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal para restaurar copia -->
      <div v-if="mostrarRestauracion" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h3 class="text-xl font-bold mb-4">Restaurar Copia de Seguridad</h3>
          <p class="mb-6">
            Seleccione la copia de seguridad que desea restaurar:
          </p>
          <div class="mb-4 max-h-60 overflow-y-auto">
            <div v-for="(copia, index) in copiasDisponibles" :key="index" class="p-2 border-b hover:bg-gray-50">
              <label class="flex items-center cursor-pointer">
                <input type="radio" :value="copia.id" v-model="copiaSeleccionada" class="mr-2">
                <div>
                  <p class="font-medium">{{ copia.fecha }}</p>
                  <p class="text-sm text-gray-600">{{ copia.pacientes }} pacientes, {{ copia.descripcion }}</p>
                </div>
              </label>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button @click="mostrarRestauracion = false" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancelar
            </button>
            <button 
              @click="restaurarCopia" 
              :disabled="!copiaSeleccionada" 
              :class="copiaSeleccionada ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-300 cursor-not-allowed'"
              class="px-4 py-2 text-white rounded">
              Restaurar Copia
            </button>
          </div>
        </div>
      </div>
      
      <!-- Modal de proceso en curso -->
      <div v-if="procesando" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-lg">{{ mensajeProcesando }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapGetters } from 'vuex'
  
  export default {
    name: 'AdministracionSistema',
    data() {
      return {
        mostrarConfirmacion: false,
        textoConfirmacion: '',
        mostrarRestauracion: false,
        copiaSeleccionada: null,
        copiasDisponibles: [
          { id: 1, fecha: '25/02/2025 09:15', pacientes: 28, descripcion: 'Copia automática semanal' },
          { id: 2, fecha: '18/02/2025 17:30', pacientes: 32, descripcion: 'Antes de actualización de sistema' }
        ],
        ultimaCopia: '25/02/2025 09:15',
        procesando: false,
        mensajeProcesando: 'Procesando...'
      }
    },
    computed: {
      ...mapState(['calendarioSemanal']),
      ...mapGetters(['totalPacientesRegistrados']),
      // Computed property con safe-check para evitar error de "Cannot read properties of undefined (reading 'forEach')"
      totalProgramados() {
        // Verificar que calendarioSemanal existe y es un array
        const calendario = this.calendarioSemanal;
        if (!calendario || !Array.isArray(calendario)) {
          return 0;
        }
        
        // Calcular pacientes programados recorriendo el calendario
        let total = 0;
        
        calendario.forEach(dia => {
          if (!dia) return;
          
          // Contar en turno de mañana
          if (dia.manana) {
            // Verificar que manana es un array
            if (Array.isArray(dia.manana)) {
              dia.manana.forEach(quirofano => {
                if (quirofano && quirofano.slots) {
                  // Verificar que slots es un array
                  if (Array.isArray(quirofano.slots)) {
                    quirofano.slots.forEach(slot => {
                      if (slot) total++;
                    });
                  }
                } else if (quirofano) {
                  // Formato anterior sin slots
                  total++;
                }
              });
            }
          }
          
          // Contar en turno de tarde
          if (dia.tarde) {
            // Verificar que tarde es un array
            if (Array.isArray(dia.tarde)) {
              dia.tarde.forEach(quirofano => {
                if (quirofano && quirofano.slots) {
                  // Verificar que slots es un array
                  if (Array.isArray(quirofano.slots)) {
                    quirofano.slots.forEach(slot => {
                      if (slot) total++;
                    });
                  }
                } else if (quirofano) {
                  // Formato anterior sin slots
                  total++;
                }
              });
            }
          }
        });
        
        return total;
      }
    },
    methods: {
      obtenerSemanaActual() {
        const hoy = new Date();
        const inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
        
        const fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6); // Domingo
        
        // Formatear las fechas
        const formatoFecha = (fecha) => {
          return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
        };
        
        return `${formatoFecha(inicio)} - ${formatoFecha(fin)}`;
      },
      async resetearSemana() {
        if (this.textoConfirmacion !== 'CONFIRMAR') return;
        
        this.procesando = true;
        this.mensajeProcesando = 'Finalizando semana actual e iniciando nueva semana...';
        
        try {
          await this.$store.dispatch('resetSemana');
          this.mostrarConfirmacion = false;
          this.textoConfirmacion = '';
          alert('Nueva semana iniciada correctamente. Los pacientes programados han sido archivados y el calendario ha sido reiniciado.');
        } catch (error) {
          alert(`Error al resetear semana: ${error.message}`);
        } finally {
          this.procesando = false;
        }
      },
      async exportarHistorico() {
        this.procesando = true;
        this.mensajeProcesando = 'Exportando histórico de pacientes...';
        
        try {
          // Simulación de exportación
          await new Promise(resolve => setTimeout(resolve, 2000));
          alert('El histórico ha sido exportado correctamente.');
        } catch (error) {
          alert(`Error al exportar histórico: ${error.message}`);
        } finally {
          this.procesando = false;
        }
      },
      async generarCopiaSeguridad() {
        this.procesando = true;
        this.mensajeProcesando = 'Generando copia de seguridad...';
        
        try {
          // Simulación de creación de copia
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const ahora = new Date();
          this.ultimaCopia = `${ahora.getDate().toString().padStart(2, '0')}/${(ahora.getMonth() + 1).toString().padStart(2, '0')}/${ahora.getFullYear()} ${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
          
          // Añadir la nueva copia a la lista
          this.copiasDisponibles.unshift({
            id: this.copiasDisponibles.length + 1,
            fecha: this.ultimaCopia,
            pacientes: this.totalPacientesRegistrados,
            descripcion: 'Copia manual'
          });
          
          alert('Copia de seguridad creada correctamente.');
        } catch (error) {
          alert(`Error al crear copia de seguridad: ${error.message}`);
        } finally {
          this.procesando = false;
        }
      },
      async restaurarCopia() {
        if (!this.copiaSeleccionada) return;
        
        const copiaARestaurar = this.copiasDisponibles.find(c => c.id === this.copiaSeleccionada);
        
        if (!confirm(`¿Está seguro de restaurar la copia del ${copiaARestaurar.fecha}? Esto reemplazará todos los datos actuales.`)) {
          return;
        }
        
        this.procesando = true;
        this.mensajeProcesando = 'Restaurando copia de seguridad...';
        
        try {
          // Simulación de restauración
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          this.mostrarRestauracion = false;
          this.copiaSeleccionada = null;
          alert(`La copia del ${copiaARestaurar.fecha} ha sido restaurada correctamente.`);
        } catch (error) {
          alert(`Error al restaurar copia: ${error.message}`);
        } finally {
          this.procesando = false;
        }
      }
    }
  }
  </script>