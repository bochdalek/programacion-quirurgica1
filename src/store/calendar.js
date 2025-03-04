// src/store/calendar.js - Fixed version
import { 
    getConfiguracion,
    updateConfiguracion,
    getCalendarioSemanal,
    updateCalendario,
    resetSemana,
    updatePaciente
  } from '../firebase'
  
  // Valores por defecto para la configuración en caso de fallo de carga
  const DEFAULT_CONFIG = [
    { manana: 2, tarde: 2 }, // Lunes
    { manana: 2, tarde: 2 }, // Martes
    { manana: 2, tarde: 2 }, // Miércoles
    { manana: 2, tarde: 2 }, // Jueves
    { manana: 2, tarde: 2 }, // Viernes
    { manana: 1, tarde: 1 }, // Sábado
    { manana: 1, tarde: 1 }  // Domingo
  ];
  
  // Valores por defecto para los días de la semana
  const DEFAULT_DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  const calendarModule = {
    state: {
      diasSemana: DEFAULT_DIAS_SEMANA,
      configuracion: [...DEFAULT_CONFIG], // Usar copia para evitar mutaciones accidentales
      calendarioSemanal: []
    },
  
    mutations: {
      // Configuración semanal
      setConfiguracion(state, config) {
        // Asegurarse de que config sea un array válido
        if (Array.isArray(config) && config.length > 0) {
          state.configuracion = config;
        } else {
          console.warn("Se intentó establecer una configuración inválida, usando valores por defecto");
          state.configuracion = [...DEFAULT_CONFIG];
        }
      },
      
      actualizarConfiguracion(state, nuevaConfig) {
        // Validar la nueva configuración
        if (Array.isArray(nuevaConfig) && nuevaConfig.length === state.diasSemana.length) {
          state.configuracion = nuevaConfig;
        } else {
          console.error("Formato inválido para actualizarConfiguracion");
        }
      },
      
      // Calendario semanal
      setCalendarioSemanal(state, calendario) {
        state.calendarioSemanal = calendario || [];
      },
      
      actualizarCalendario(state, nuevoCalendario) {
        state.calendarioSemanal = nuevoCalendario || [];
      },
      
      inicializarDiaCalendario(state, dia) {
        // Asegurarse de que calendarioSemanal sea un array
        if (!Array.isArray(state.calendarioSemanal)) {
          state.calendarioSemanal = [];
        }
        
        // Asegurarse de que el día especificado sea un índice válido
        if (dia >= 0 && dia < state.diasSemana.length) {
          // Inicializar el día si no existe
          if (!state.calendarioSemanal[dia]) {
            state.calendarioSemanal[dia] = {
              manana: [],
              tarde: []
            };
          }
        }
      },
      
      inicializarQuirofanoConSlots(state, { dia, turno, quirofano }) {
        // Asegurarse de que calendarioSemanal sea un array
        if (!Array.isArray(state.calendarioSemanal)) {
          state.calendarioSemanal = [];
        }
        
        // Inicializar el día si no existe
        if (!state.calendarioSemanal[dia]) {
          state.calendarioSemanal[dia] = {};
        }
        
        // Inicializar el turno si no existe
        if (!state.calendarioSemanal[dia][turno]) {
          state.calendarioSemanal[dia][turno] = [];
        }
        
        // Inicializar el quirófano con slots si no existe
        if (!state.calendarioSemanal[dia][turno][quirofano]) {
          state.calendarioSemanal[dia][turno][quirofano] = {
            slots: [null, null, null]
          };
        }
      },
      
      asignarPacienteASlot(state, { dia, turno, quirofano, slot, paciente }) {
        // Asegurarse de que calendarioSemanal sea un array
        if (!Array.isArray(state.calendarioSemanal)) {
          state.calendarioSemanal = [];
        }
        
        // Inicializar el día si no existe
        if (!state.calendarioSemanal[dia]) {
          state.calendarioSemanal[dia] = {};
        }
        
        // Inicializar el turno si no existe
        if (!state.calendarioSemanal[dia][turno]) {
          state.calendarioSemanal[dia][turno] = [];
        }
        
        // Inicializar el quirófano con slots si no existe
        if (!state.calendarioSemanal[dia][turno][quirofano]) {
          state.calendarioSemanal[dia][turno][quirofano] = {
            slots: [null, null, null]
          };
        } else if (!state.calendarioSemanal[dia][turno][quirofano].slots) {
          // Si existe el quirófano pero no tiene slots (formato antiguo), convertirlo
          const pacienteExistente = state.calendarioSemanal[dia][turno][quirofano];
          state.calendarioSemanal[dia][turno][quirofano] = {
            slots: [pacienteExistente, null, null]
          };
        }
        
        // Asignar el paciente al slot
        state.calendarioSemanal[dia][turno][quirofano].slots[slot] = paciente;
      },
      
      quitarPacienteDeSlot(state, { dia, turno, quirofano, slot }) {
        // Verificar que todos los niveles de la estructura existen
        if (state.calendarioSemanal &&
            state.calendarioSemanal[dia] &&
            state.calendarioSemanal[dia][turno] &&
            state.calendarioSemanal[dia][turno][quirofano] &&
            state.calendarioSemanal[dia][turno][quirofano].slots) {
          // Quitar el paciente estableciendo el slot a null
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
          
          // Verificar si la configuración es válida
          if (config && (Array.isArray(config) || typeof config === 'object')) {
            commit('setConfiguracion', config);
          } else {
            console.warn("La API devolvió una configuración inválida, usando valores por defecto");
            commit('setConfiguracion', DEFAULT_CONFIG);
          }
        } catch (error) {
          console.error("Error al cargar configuración:", error);
          commit('setError', error.message, { root: true });
          
          // Usar configuración por defecto en caso de error
          console.warn("Usando configuración por defecto debido a error");
          commit('setConfiguracion', DEFAULT_CONFIG);
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
          console.error("Error al guardar configuración:", error);
          commit('setError', error.message, { root: true });
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
          console.error("Error al cargar calendario semanal:", error);
          commit('setError', error.message, { root: true });
          // Establecer un calendario vacío en caso de error
          commit('setCalendarioSemanal', []);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async saveCalendarioSemanal({ commit, state }) {
        commit('setLoading', true, { root: true });
        
        try {
          await updateCalendario('actual', state.calendarioSemanal);
        } catch (error) {
          console.error("Error al guardar calendario semanal:", error);
          commit('setError', error.message, { root: true });
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      // Algoritmo de programación
      async ejecutarAlgoritmo({ commit, state, rootState, dispatch }) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacientesPendientes = rootState.patients?.pacientesPendientes || [];
          
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
          
          // Asegurarnos de que la configuración sea válida
          const configuracion = Array.isArray(state.configuracion) && state.configuracion.length > 0 
            ? state.configuracion 
            : DEFAULT_CONFIG;
  
          // Para cada día de la semana
          for (let dia = 0; dia < (state.diasSemana || DEFAULT_DIAS_SEMANA).length; dia++) {
            try {
              // PARTE 1: Turno de tarde - fracturas de cadera siguiendo reglas específicas
              const quirofanosTarde = configuracion[dia] ? (configuracion[dia].tarde || 0) : 0;
  
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
                    try {
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
                    } catch (err) {
                      console.error("Error al actualizar estado de pacientes:", err);
                      // Continuar con el algoritmo aunque falle la actualización
                    }
                  }
                } else if (q < quirofanosTarde && subcapitales.length >= 1) {
                  // Regla: 1 subcapital por quirófano
                  const paciente = subcapitales.shift();
                  nuevoCalendario[dia].tarde[q].slots[0] = paciente;
                  if (paciente) {
                    try {
                      await updatePaciente(paciente.id, { 
                        estado: 'programado', 
                        diaOperacion: dia, 
                        turnoOperacion: 'tarde', 
                        quirofanoOperacion: q,
                        slotOperacion: 0
                      });
                    } catch (err) {
                      console.error("Error al actualizar estado de paciente:", err);
                    }
                  }
                } else if (q < quirofanosTarde && subtrocantereas.length >= 1) {
                  // Regla: 1 subtrocantérea por quirófano
                  const paciente = subtrocantereas.shift();
                  nuevoCalendario[dia].tarde[q].slots[0] = paciente;
                  if (paciente) {
                    try {
                      await updatePaciente(paciente.id, { 
                        estado: 'programado', 
                        diaOperacion: dia, 
                        turnoOperacion: 'tarde', 
                        quirofanoOperacion: q,
                        slotOperacion: 0
                      });
                    } catch (err) {
                      console.error("Error al actualizar estado de paciente:", err);
                    }
                  }
                } else if (q < quirofanosTarde && pertrocantereas.length === 1) {
                  // Caso especial: si solo queda 1 pertrocantérea
                  const paciente = pertrocantereas.shift();
                  nuevoCalendario[dia].tarde[q].slots[0] = paciente;
                  if (paciente) {
                    try {
                      await updatePaciente(paciente.id, { 
                        estado: 'programado', 
                        diaOperacion: dia, 
                        turnoOperacion: 'tarde', 
                        quirofanoOperacion: q,
                        slotOperacion: 0
                      });
                    } catch (err) {
                      console.error("Error al actualizar estado de paciente:", err);
                    }
                  }
                }
              }
  
              // PARTE 2: Turno de mañana - resto de pacientes (no fracturas de cadera)
              const quirofanosManana = configuracion[dia] ? (configuracion[dia].manana || 0) : 0;
  
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
                      try {
                        await updatePaciente(paciente.id, { 
                          estado: 'programado', 
                          diaOperacion: dia, 
                          turnoOperacion: 'manana', 
                          quirofanoOperacion: q,
                          slotOperacion: slot
                        });
                      } catch (err) {
                        console.error("Error al actualizar estado de paciente:", err);
                      }
                    }
                  }
                }
              }
            } catch (dayError) {
              console.error(`Error al procesar el día ${dia}:`, dayError);
              // Continuar con el siguiente día
            }
          } // Cierre del bucle for de los días
  
          // Los pacientes que no se pudieron asignar se quedan en las listas
          // y seguirán apareciendo como pendientes
  
          // Actualizar el calendario en la base de datos
          try {
            await updateCalendario('actual', nuevoCalendario);
          } catch (calendarError) {
            console.error("Error al guardar calendario:", calendarError);
            // Aunque falle la actualización en la BD, actualizar el estado local
          }
          
          // Actualizar el estado local
          commit('actualizarCalendario', nuevoCalendario);
          
          // Recargar pacientes pendientes (los que quedaron sin asignar y los nuevos)
          try {
            await dispatch('fetchPacientesPendientes', null, { root: true });
          } catch (fetchError) {
            console.error("Error al recargar pacientes pendientes:", fetchError);
          }
        } catch (error) {
          console.error("Error al ejecutar algoritmo:", error);
          commit('setError', error.message, { root: true });
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
          console.error("Error al resetear semana:", error);
          commit('setError', error.message, { root: true });
        } finally {
          commit('setLoading', false, { root: true });
        }
      }
    }
  };
  
  export default calendarModule;