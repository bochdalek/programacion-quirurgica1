// src/store/calendar.js
import { 
    getConfiguracion,
    updateConfiguracion,
    getCalendarioSemanal,
    updateCalendario,
    resetSemana,
    updatePaciente
  } from '../firebase'
  
  const calendarModule = {
    state: {
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      configuracion: [
        { manana: 2, tarde: 2 },
        { manana: 2, tarde: 2 },
        { manana: 2, tarde: 2 },
        { manana: 2, tarde: 2 },
        { manana: 2, tarde: 2 },
        { manana: 1, tarde: 1 },
        { manana: 1, tarde: 1 }
      ],
      calendarioSemanal: []
    },
  
    mutations: {
      // Configuración semanal
      setConfiguracion(state, config) {
        state.configuracion = config;
      },
      
      actualizarConfiguracion(state, nuevaConfig) {
        state.configuracion = nuevaConfig;
      },
      
      // Calendario semanal
      setCalendarioSemanal(state, calendario) {
        state.calendarioSemanal = calendario;
      },
      
      actualizarCalendario(state, nuevoCalendario) {
        state.calendarioSemanal = nuevoCalendario;
      },
      
      inicializarDiaCalendario(state, dia) {
        if (!state.calendarioSemanal[dia]) {
          state.calendarioSemanal[dia] = {
            manana: [],
            tarde: []
          };
        }
      },
      
      inicializarQuirofanoConSlots(state, { dia, turno, quirofano }) {
        if (!state.calendarioSemanal[dia]) {
          state.calendarioSemanal[dia] = {};
        }
        if (!state.calendarioSemanal[dia][turno]) {
          state.calendarioSemanal[dia][turno] = [];
        }
        
        if (!state.calendarioSemanal[dia][turno][quirofano]) {
          state.calendarioSemanal[dia][turno][quirofano] = {
            slots: [null, null, null]
          };
        }
      },
      
      asignarPacienteASlot(state, { dia, turno, quirofano, slot, paciente }) {
        if (!state.calendarioSemanal[dia]) {
          state.calendarioSemanal[dia] = {};
        }
        if (!state.calendarioSemanal[dia][turno]) {
          state.calendarioSemanal[dia][turno] = [];
        }
        if (!state.calendarioSemanal[dia][turno][quirofano]) {
          state.calendarioSemanal[dia][turno][quirofano] = {
            slots: [null, null, null]
          };
        } else if (!state.calendarioSemanal[dia][turno][quirofano].slots) {
          const pacienteExistente = state.calendarioSemanal[dia][turno][quirofano];
          state.calendarioSemanal[dia][turno][quirofano] = {
            slots: [pacienteExistente, null, null]
          };
        }
        
        state.calendarioSemanal[dia][turno][quirofano].slots[slot] = paciente;
      },
      
      quitarPacienteDeSlot(state, { dia, turno, quirofano, slot }) {
        if (state.calendarioSemanal[dia] &&
            state.calendarioSemanal[dia][turno] &&
            state.calendarioSemanal[dia][turno][quirofano] &&
            state.calendarioSemanal[dia][turno][quirofano].slots) {
          state.calendarioSemanal[dia][turno][quirofano].slots[slot] = null;
        }
      }
    },
  
    actions: {
      // Configuración
      async fetchConfiguracion({ commit }) {
        commit('setLoading', true, { root: true });
        commit('setError', null, { root: true });
        
        try {
          const config = await getConfiguracion();
          commit('setConfiguracion', config);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al cargar configuración:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async saveConfiguracion({ commit }, nuevaConfig) {
        commit('setLoading', true, { root: true });
        commit('setError', null, { root: true });
        
        try {
          await updateConfiguracion('semanal', nuevaConfig);
          commit('actualizarConfiguracion', nuevaConfig);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al guardar configuración:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      // Calendario semanal
      async fetchCalendarioSemanal({ commit }) {
        commit('setLoading', true, { root: true });
        
        try {
          const calendario = await getCalendarioSemanal();
          commit('setCalendarioSemanal', calendario);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al cargar calendario semanal:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async saveCalendarioSemanal({ commit, state }) {
        commit('setLoading', true, { root: true });
        
        try {
          await updateCalendario('actual', state.calendarioSemanal);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al guardar calendario semanal:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      // Algoritmo de programación
      async ejecutarAlgoritmo({ commit, state, rootState, dispatch }) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacientesPendientes = rootState.patients.pacientesPendientes;
          
          // Ordenar por prioridad y tiempo de espera
          const pacientesOrdenados = [...pacientesPendientes].sort((a, b) => {
            // Primero por prioridad si está definida
            if (a.prioridad && b.prioridad) {
              return a.prioridad - b.prioridad;
            }
            // Después por fecha de ingreso
            return new Date(a.fechaIngreso) - new Date(b.fechaIngreso);
          });
  
          // Separar pacientes por tipo
          const pertrocantereas = pacientesOrdenados.filter(p => 
            p.tipoFractura === 'Cadera - Pertrocantérea'
          );
  
          const subtrocantereas = pacientesOrdenados.filter(p => 
            p.tipoFractura === 'Cadera - Subtrocantérea'
          );
  
          const subcapitales = pacientesOrdenados.filter(p => 
            p.tipoFractura === 'Cadera - Subcapital'
          );
  
          const otrosPacientes = pacientesOrdenados.filter(p => 
            !['Cadera - Pertrocantérea', 'Cadera - Subtrocantérea', 'Cadera - Subcapital'].includes(p.tipoFractura)
          );
  
          // Reiniciar calendario pero conservando formato con slots
          const nuevoCalendario = Array(7).fill().map(() => ({
            manana: [],
            tarde: []
          }));
  
          // Para cada día de la semana
          for (let dia = 0; dia < state.diasSemana.length; dia++) {
            // PARTE 1: Turno de tarde - fracturas de cadera siguiendo reglas específicas
            const quirofanosTarde = state.configuracion[dia].tarde;
  
            // Inicializar quirófanos con slots
            for (let q = 0; q < quirofanosTarde; q++) {
              nuevoCalendario[dia].tarde.push({
                slots: [null, null, null]
              });
  
              // Intentar asignar pacientes según reglas específicas
              // Regla: nunca mezclar diferentes tipos de fracturas en el mismo quirófano
              if (q < quirofanosTarde && pertrocantereas.length >= 2) {
                // Regla: 2 pertrocantéreas por quirófano
                const paciente1 = pertrocantereas.shift();
                const paciente2 = pertrocantereas.shift();
                nuevoCalendario[dia].tarde[q].slots[0] = paciente1;
                nuevoCalendario[dia].tarde[q].slots[1] = paciente2;
                
                // Actualizar estado de los pacientes
                if (paciente1 && paciente2) {
                  await updatePaciente(paciente1.id, { 
                    estado: 'programado', 
                    diaOperacion: dia, 
                    turnoOperacion: 'tarde', 
                    quirofanoOperacion: q,
                    slotOperacion: 0
                  });
                  await updatePaciente(paciente2.id, { 
                    estado: 'programado', 
                    diaOperacion: dia, 
                    turnoOperacion: 'tarde', 
                    quirofanoOperacion: q,
                    slotOperacion: 1
                  });
                }
              } else if (q < quirofanosTarde && subcapitales.length >= 1) {
                // Regla: 1 subcapital por quirófano
                const paciente = subcapitales.shift();
                nuevoCalendario[dia].tarde[q].slots[0] = paciente;
                if (paciente) {
                  await updatePaciente(paciente.id, { 
                    estado: 'programado', 
                    diaOperacion: dia, 
                    turnoOperacion: 'tarde', 
                    quirofanoOperacion: q,
                    slotOperacion: 0
                  });
                }
              } else if (q < quirofanosTarde && subtrocantereas.length >= 1) {
                // Regla: 1 subtrocantérea por quirófano
                const paciente = subtrocantereas.shift();
                nuevoCalendario[dia].tarde[q].slots[0] = paciente;
                if (paciente) {
                  await updatePaciente(paciente.id, { 
                    estado: 'programado', 
                    diaOperacion: dia, 
                    turnoOperacion: 'tarde', 
                    quirofanoOperacion: q,
                    slotOperacion: 0
                  });
                }
              } else if (q < quirofanosTarde && pertrocantereas.length === 1) {
                // Caso especial: si solo queda 1 pertrocantérea
                const paciente = pertrocantereas.shift();
                nuevoCalendario[dia].tarde[q].slots[0] = paciente;
                if (paciente) {
                  await updatePaciente(paciente.id, { 
                    estado: 'programado', 
                    diaOperacion: dia, 
                    turnoOperacion: 'tarde', 
                    quirofanoOperacion: q,
                    slotOperacion: 0
                  });
                }
              }
            }
  
            // PARTE 2: Turno de mañana - resto de pacientes (no fracturas de cadera)
            const quirofanosManana = state.configuracion[dia].manana;
  
            // Inicializar quirófanos con slots
            for (let q = 0; q < quirofanosManana; q++) {
              nuevoCalendario[dia].manana.push({
                slots: [null, null, null]
              });
  
              // Asignar otros pacientes a la mañana (no fracturas de cadera)
              if (otrosPacientes.length > 0) {
                // Intentar llenar los slots con otros pacientes
                for (let slot = 0; slot < 3 && otrosPacientes.length > 0; slot++) {
                  const paciente = otrosPacientes.shift();
                  nuevoCalendario[dia].manana[q].slots[slot] = paciente;
                  if (paciente) {
                    await updatePaciente(paciente.id, { 
                      estado: 'programado', 
                      diaOperacion: dia, 
                      turnoOperacion: 'manana', 
                      quirofanoOperacion: q,
                      slotOperacion: slot
                    });
                  }
                }
              }
            }
          } // Cierre del bucle for de los días
  
          // Los pacientes que no se pudieron asignar se quedan en las listas
          // y seguirán apareciendo como pendientes
  
          // Actualizar el calendario en la base de datos
          await updateCalendario('actual', nuevoCalendario);
          
          // Actualizar el estado local
          commit('actualizarCalendario', nuevoCalendario);
          
          // Recargar pacientes pendientes (los que quedaron sin asignar y los nuevos)
          await dispatch('fetchPacientesPendientes', null, { root: true });
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al ejecutar algoritmo:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      // Resetear semana
      async resetSemana({ commit, dispatch }) {
        commit('setLoading', true, { root: true });
        
        try {
          // Esta función moverá pacientes programados a histórico y limpiará el calendario
          await resetSemana();
          
          // Recargar los datos
          await dispatch('fetchInitialData', null, { root: true });
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al resetear semana:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      }
    }
  };
  
  export default calendarModule;