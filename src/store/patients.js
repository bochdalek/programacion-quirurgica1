// src/store/patients.js
import { 
    getPacientesByEstado, 
    addPaciente, 
    updatePaciente
  } from '../firebase'
  
  const patientsModule = {
    state: {
      pacientesUrgentes: [],
      pacientesPresentar: [],
      pacientesNoProgMedicacion: [],
      pacientesNoProgPartesBlandas: [],
      pacientesPendientes: []
    },
  
    getters: {
      hayPacientesPendientes: state => state.pacientesPendientes.length > 0,
      totalPacientesRegistrados: state => {
        return state.pacientesUrgentes.length + 
               state.pacientesPresentar.length + 
               state.pacientesNoProgMedicacion.length + 
               state.pacientesNoProgPartesBlandas.length + 
               state.pacientesPendientes.length
      }
    },
  
    mutations: {
      // Pacientes urgentes
      setPacientesUrgentes(state, pacientes) {
        state.pacientesUrgentes = pacientes
      },
      
      agregarPacienteUrgente(state, paciente) {
        // Asegurar que pacientesUrgentes sea un array
        if (!Array.isArray(state.pacientesUrgentes)) {
          state.pacientesUrgentes = [];
        }
        state.pacientesUrgentes.push(paciente)
      },
      
      eliminarPacienteUrgente(state, index) {
        state.pacientesUrgentes.splice(index, 1)
      },
      
      // Pacientes presentar
      setPacientesPresentar(state, pacientes) {
        state.pacientesPresentar = pacientes
      },
      
      agregarPacientePresentar(state, paciente) {
        // Asegurar que pacientesPresentar sea un array
        if (!Array.isArray(state.pacientesPresentar)) {
          state.pacientesPresentar = [];
        }
        console.log("Añadiendo paciente a la lista de presentar:", paciente);
        state.pacientesPresentar.push(paciente)
      },
      
      eliminarPacientePresentar(state, index) {
        state.pacientesPresentar.splice(index, 1)
      },
      
      // Pacientes no programables por medicación
      setPacientesNoProgMedicacion(state, pacientes) {
        state.pacientesNoProgMedicacion = pacientes
      },
      
      agregarPacienteNoProgMedicacion(state, paciente) {
        // Asegurar que pacientesNoProgMedicacion sea un array
        if (!Array.isArray(state.pacientesNoProgMedicacion)) {
          state.pacientesNoProgMedicacion = [];
        }
        state.pacientesNoProgMedicacion.push(paciente)
      },
      
      eliminarPacienteNoProgMedicacion(state, index) {
        state.pacientesNoProgMedicacion.splice(index, 1)
      },
      
      actualizarPacienteNoProgMedicacion(state, { id, paciente }) {
        const index = state.pacientesNoProgMedicacion.findIndex(p => p.id === id)
        if (index !== -1) {
          state.pacientesNoProgMedicacion[index] = paciente
        }
      },
      
      // Pacientes no programables por partes blandas
      setPacientesNoProgPartesBlandas(state, pacientes) {
        state.pacientesNoProgPartesBlandas = pacientes
      },
      
      agregarPacienteNoProgPartesBlandas(state, paciente) {
        // Asegurar que pacientesNoProgPartesBlandas sea un array
        if (!Array.isArray(state.pacientesNoProgPartesBlandas)) {
          state.pacientesNoProgPartesBlandas = [];
        }
        state.pacientesNoProgPartesBlandas.push(paciente)
      },
      
      eliminarPacienteNoProgPartesBlandas(state, index) {
        state.pacientesNoProgPartesBlandas.splice(index, 1)
      },
      
      // Pacientes pendientes
      setPacientesPendientes(state, pacientes) {
        state.pacientesPendientes = pacientes
      },
      
      agregarPacientePendiente(state, paciente) {
        // Asegurar que pacientesPendientes sea un array
        if (!Array.isArray(state.pacientesPendientes)) {
          state.pacientesPendientes = [];
        }
        state.pacientesPendientes.push(paciente)
      },
      
      actualizarPacientesPendientes(state, nuevaLista) {
        state.pacientesPendientes = nuevaLista
      },
      
      quitarPacientePendiente(state, index) {
        state.pacientesPendientes.splice(index, 1)
      },
    },
  
    actions: {
      // Pacientes urgentes
      async fetchPacientesUrgentes({ commit }) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacientes = await getPacientesByEstado('urgente');
          commit('setPacientesUrgentes', pacientes);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al cargar pacientes urgentes:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async addPacienteUrgente({ commit }, paciente) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacienteToSave = {
            ...paciente,
            estado: 'urgente'
          };
          
          const id = await addPaciente(pacienteToSave);
          commit('agregarPacienteUrgente', { id, ...pacienteToSave });
          return { success: true };
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al añadir paciente urgente:", error);
          throw error;
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async operarPacienteUrgente({ commit, dispatch }, { paciente, requiereSegunda }) {
        console.log("Operando paciente urgente:", paciente, "requiere segunda:", requiereSegunda);
        commit('setLoading', true, { root: true });
        
        try {
          if (requiereSegunda) {
            // Actualizar estado y mover a no programables
            await updatePaciente(paciente.id, { 
              estado: 'noProgPartesBlandas',
              fechaPrimeraCirugia: new Date().toISOString().slice(0, 10),
              motivo: 'Pendiente evaluación post-cirugía'
            });
            
            // Buscar índice del paciente en urgentes
            const index = this.state.patients.pacientesUrgentes.findIndex(p => p.id === paciente.id);
            if (index !== -1) {
              // Eliminar de urgentes
              commit('eliminarPacienteUrgente', index);
            } else {
              console.error("No se encontró el paciente en la lista de urgentes:", paciente.id);
            }
            
            // Actualizar lista de no programables
            await dispatch('fetchPacientesNoProgPartesBlandas');
          } else {
            // Marcar como operado y archivar
            await updatePaciente(paciente.id, { 
              estado: 'operado', 
              fechaOperacion: new Date().toISOString() 
            });
            
            // Buscar índice del paciente en urgentes
            const index = this.state.patients.pacientesUrgentes.findIndex(p => p.id === paciente.id);
            if (index !== -1) {
              // Eliminar de urgentes
              commit('eliminarPacienteUrgente', index);
            } else {
              console.error("No se encontró el paciente en la lista de urgentes:", paciente.id);
            }
          }
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al operar paciente urgente:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      // Pacientes para presentar
      async fetchPacientesPresentar({ commit }) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacientes = await getPacientesByEstado('presentar');
          console.log("Pacientes para presentar recuperados:", pacientes);
          commit('setPacientesPresentar', pacientes);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al cargar pacientes para presentar:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async addPacientePresentar({ commit }, paciente) {
        commit('setLoading', true, { root: true });
        
        try {
          console.log("addPacientePresentar - Datos recibidos:", paciente);
          
          // Verificar que el paciente tiene los campos necesarios
          if (!paciente.nombre || !paciente.edad) {
            throw new Error("Faltan datos del paciente");
          }
          
          const pacienteToSave = {
            ...paciente,
            estado: 'presentar',
            fechaIngreso: paciente.fechaIngreso || new Date().toISOString()
          };
          
          console.log("addPacientePresentar - Guardando paciente:", pacienteToSave);
          const id = await addPaciente(pacienteToSave);
          
          // Crear el objeto completo a guardar en el store
          const pacienteCompleto = { id, ...pacienteToSave };
          console.log("addPacientePresentar - Paciente guardado con ID:", id, pacienteCompleto);
          
          // Actualizar el store
          commit('agregarPacientePresentar', pacienteCompleto);
          return { success: true, id };
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al añadir paciente para presentar:", error);
          throw error;
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async moverAPendientes({ commit, dispatch }, { paciente, origen }) {
        console.log("Moviendo paciente a pendientes:", paciente, "desde", origen);
        commit('setLoading', true, { root: true });
        
        try {
          // Actualizar estado del paciente en la base de datos
          await updatePaciente(paciente.id, { 
            estado: 'pendiente',
            fechaListoParaProgramar: new Date().toISOString()
          });
          
          // Actualizar el estado local según el origen
          if (origen === 'presentar') {
            // Buscar el índice del paciente en la lista de presentar
            const index = this.state.patients.pacientesPresentar.findIndex(p => p.id === paciente.id);
            if (index !== -1) {
              // Eliminarlo de la lista de presentar
              commit('eliminarPacientePresentar', index);
            } else {
              console.error("No se encontró el paciente en la lista de presentar:", paciente.id);
            }
          } else if (origen === 'noProgMedicacion') {
            // Buscar el índice del paciente en la lista de no programables por medicación
            const index = this.state.patients.pacientesNoProgMedicacion.findIndex(p => p.id === paciente.id);
            if (index !== -1) {
              // Eliminarlo de la lista de no programables por medicación
              commit('eliminarPacienteNoProgMedicacion', index);
            } else {
              console.error("No se encontró el paciente en la lista de no programables por medicación:", paciente.id);
            }
          } else if (origen === 'noProgPartesBlandas') {
            // Buscar el índice del paciente en la lista de no programables por partes blandas
            const index = this.state.patients.pacientesNoProgPartesBlandas.findIndex(p => p.id === paciente.id);
            if (index !== -1) {
              // Eliminarlo de la lista de no programables por partes blandas
              commit('eliminarPacienteNoProgPartesBlandas', index);
            } else {
              console.error("No se encontró el paciente en la lista de no programables por partes blandas:", paciente.id);
            }
          }
          
          // Actualizar lista de pendientes
          await dispatch('fetchPacientesPendientes');
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al mover paciente a pendientes:", error);
          throw error;
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async moverANoProgramables({ commit, dispatch }, { paciente, tipo }) {
        console.log("Moviendo paciente a no programables:", paciente, "tipo:", tipo);
        commit('setLoading', true, { root: true });
        
        try {
          if (tipo === 'medicacion') {
            // Determinar tiempo restante según medicación
            let tiempoRestante = 0;
            let medicacionNombre = '';
            
            // Antiagregantes
            if (paciente.medicacion?.aas) {
              tiempoRestante = 144; // 6 días en horas (promedio 5-7 días)
              medicacionNombre = 'Ácido Acetilsalicílico';
            } else if (paciente.medicacion?.clopidogrel) {
              tiempoRestante = 144; // 6 días en horas
              medicacionNombre = 'Clopidogrel';
            } else if (paciente.medicacion?.prasugrel) {
              tiempoRestante = 204; // 8.5 días en horas
              medicacionNombre = 'Prasugrel';
            } else if (paciente.medicacion?.ticagrelor) {
              tiempoRestante = 120; // 5 días en horas
              medicacionNombre = 'Ticagrelor';
            } 
            // Anticoagulantes
            else if (paciente.medicacion?.warfarina) {
              tiempoRestante = 120; // 5 días en horas
              medicacionNombre = 'Warfarina';
            } else if (paciente.medicacion?.dabigatran) {
              tiempoRestante = 48; // 2 días en horas
              medicacionNombre = 'Dabigatrán';
            } else if (paciente.medicacion?.rivaroxaban) {
              tiempoRestante = 48; // 2 días en horas
              medicacionNombre = 'Rivaroxabán';
            } else if (paciente.medicacion?.apixaban) {
              tiempoRestante = 48; // 2 días en horas
              medicacionNombre = 'Apixabán';
            } 
            // Otros
            else if (paciente.medicacion?.hbpm) {
              tiempoRestante = 12; // 12 horas
              medicacionNombre = 'HBPM';
            }
            
            // Actualizar el paciente
            await updatePaciente(paciente.id, {
              estado: 'noProgMedicacion',
              medicacion: medicacionNombre,
              tiempoRestante: tiempoRestante,
              fechaProyectadaDisponible: new Date(Date.now() + tiempoRestante * 60 * 60 * 1000).toISOString()
            });
            
            // Encontrar el índice para eliminarlo de la lista de presentar
            const index = this.state.patients.pacientesPresentar.findIndex(p => p.id === paciente.id);
            if (index !== -1) {
              // Eliminarlo de la lista de presentar
              commit('eliminarPacientePresentar', index);
            } else {
              console.error("No se encontró el paciente en la lista de presentar:", paciente.id);
            }
            
            // Actualizar lista de no programables
            await dispatch('fetchPacientesNoProgMedicacion');
          } 
          else if (tipo === 'partesBlandas') {
            await updatePaciente(paciente.id, {
              estado: 'noProgPartesBlandas',
              fechaPrimeraCirugia: new Date().toISOString().slice(0, 10),
              motivo: paciente.motivo || 'Pendiente de evaluación'
            });
            
            // Encontrar el índice para eliminarlo de la lista de presentar o urgentes
            const indexPresentar = this.state.patients.pacientesPresentar.findIndex(p => p.id === paciente.id);
            const indexUrgentes = this.state.patients.pacientesUrgentes.findIndex(p => p.id === paciente.id);
            
            if (indexPresentar !== -1) {
              // Eliminarlo de la lista de presentar
              commit('eliminarPacientePresentar', indexPresentar);
            } else if (indexUrgentes !== -1) {
              // Eliminarlo de la lista de urgentes
              commit('eliminarPacienteUrgente', indexUrgentes);
            } else {
              console.error("No se encontró el paciente en ninguna lista:", paciente.id);
            }
            
            // Actualizar lista de no programables
            await dispatch('fetchPacientesNoProgPartesBlandas');
          }
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al mover paciente a no programables:", error);
          throw error;
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      // Pacientes no programables por medicación
      async fetchPacientesNoProgMedicacion({ commit }) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacientes = await getPacientesByEstado('noProgMedicacion');
          commit('setPacientesNoProgMedicacion', pacientes);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al cargar pacientes no programables por medicación:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async actualizarTiempoMedicacion({ dispatch, state }) {
        // Pacientes con medicación: actualizar tiempos
        const pacientes = [...state.pacientesNoProgMedicacion];
        
        for (const paciente of pacientes) {
          if (paciente.tiempoRestante > 0) {
            try {
              // Reducir en 1 hora
              await updatePaciente(paciente.id, { 
                tiempoRestante: paciente.tiempoRestante - 1 
              });
              
              // Si llega a cero, podríamos notificar
              if (paciente.tiempoRestante === 1) { // será 0 después de la actualización
                console.log(`Paciente ${paciente.nombre || paciente.id} listo para programar`);
              }
            } catch (error) {
              console.error("Error al actualizar tiempo de medicación:", error);
            }
          }
        }
        
        // Recargar la lista completa
        await dispatch('fetchPacientesNoProgMedicacion');
      },
      
      // Pacientes no programables por partes blandas
      async fetchPacientesNoProgPartesBlandas({ commit }) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacientes = await getPacientesByEstado('noProgPartesBlandas');
          commit('setPacientesNoProgPartesBlandas', pacientes);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al cargar pacientes no programables por partes blandas:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      // Pacientes pendientes
      async fetchPacientesPendientes({ commit }) {
        commit('setLoading', true, { root: true });
        
        try {
          const pacientes = await getPacientesByEstado('pendiente');
          commit('setPacientesPendientes', pacientes);
        } catch (error) {
          commit('setError', error.message, { root: true });
          console.error("Error al cargar pacientes pendientes:", error);
        } finally {
          commit('setLoading', false, { root: true });
        }
      },
      
      async updatePacientePendiente({ dispatch }, { pacienteId, datos }) {
        try {
          await updatePaciente(pacienteId, datos);
          // Recargar la lista de pendientes para reflejar los cambios
          await dispatch('fetchPacientesPendientes');
        } catch (error) {
          console.error("Error al actualizar paciente pendiente:", error);
          throw error;
        }
      }
    }
  };
  
  export default patientsModule;