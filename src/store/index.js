// src/store/index.js
import { createStore } from 'vuex'
import authModule from './auth'
import { 
  getPacientesByEstado, 
  addPaciente, 
  updatePaciente, 
  getConfiguracion,
  updateConfiguracion,
  getCalendarioSemanal,
  updateCalendario,
  resetSemana
} from '../firebase'

export default createStore({
  modules: {
    auth: authModule
  },
  
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
    pacientesUrgentes: [],
    pacientesPresentar: [],
    pacientesNoProgMedicacion: [],
    pacientesNoProgPartesBlandas: [],
    pacientesPendientes: [],
    calendarioSemanal: [],
    isLoading: false,
    error: null
  },
  
  getters: {
    hayPacientesPendientes(state) {
      return state.pacientesPendientes.length > 0
    },
    totalPacientesRegistrados(state) {
      return state.pacientesUrgentes.length + 
             state.pacientesPresentar.length + 
             state.pacientesNoProgMedicacion.length + 
             state.pacientesNoProgPartesBlandas.length + 
             state.pacientesPendientes.length
    }
  },
  
  mutations: {
    setLoading(state, isLoading) {
      state.isLoading = isLoading
    },
    
    setError(state, error) {
      state.error = error
    },
    
    // Configuración semanal
    setConfiguracion(state, config) {
      state.configuracion = config
    },
    
    actualizarConfiguracion(state, nuevaConfig) {
      state.configuracion = nuevaConfig
    },
    
    // Pacientes urgentes
    setPacientesUrgentes(state, pacientes) {
      state.pacientesUrgentes = pacientes
    },
    
    agregarPacienteUrgente(state, paciente) {
      state.pacientesUrgentes.push(paciente)
    },
    
    eliminarPacienteUrgente(state, id) {
      state.pacientesUrgentes = state.pacientesUrgentes.filter(p => p.id !== id)
    },
    
    // Pacientes presentar
    setPacientesPresentar(state, pacientes) {
      state.pacientesPresentar = pacientes
    },
    
    agregarPacientePresentar(state, paciente) {
      state.pacientesPresentar.push(paciente)
    },
    
    eliminarPacientePresentar(state, id) {
      state.pacientesPresentar = state.pacientesPresentar.filter(p => p.id !== id)
    },
    
    // Pacientes no programables por medicación
    setPacientesNoProgMedicacion(state, pacientes) {
      state.pacientesNoProgMedicacion = pacientes
    },
    
    agregarPacienteNoProgMedicacion(state, paciente) {
      state.pacientesNoProgMedicacion.push(paciente)
    },
    
    actualizarPacienteNoProgMedicacion(state, { id, paciente }) {
      const index = state.pacientesNoProgMedicacion.findIndex(p => p.id === id)
      if (index !== -1) {
        state.pacientesNoProgMedicacion[index] = paciente
      }
    },
    
    eliminarPacienteNoProgMedicacion(state, id) {
      state.pacientesNoProgMedicacion = state.pacientesNoProgMedicacion.filter(p => p.id !== id)
    },
    
    // Pacientes no programables por partes blandas
    setPacientesNoProgPartesBlandas(state, pacientes) {
      state.pacientesNoProgPartesBlandas = pacientes
    },
    
    agregarPacienteNoProgPartesBlandas(state, paciente) {
      state.pacientesNoProgPartesBlandas.push(paciente)
    },
    
    eliminarPacienteNoProgPartesBlandas(state, id) {
      state.pacientesNoProgPartesBlandas = state.pacientesNoProgPartesBlandas.filter(p => p.id !== id)
    },
    
    // Pacientes pendientes
    setPacientesPendientes(state, pacientes) {
      state.pacientesPendientes = pacientes
    },
    
    agregarPacientePendiente(state, paciente) {
      state.pacientesPendientes.push(paciente)
    },
    
    actualizarPacientesPendientes(state, nuevaLista) {
      state.pacientesPendientes = nuevaLista
    },
    
    quitarPacientePendiente(state, id) {
      state.pacientesPendientes = state.pacientesPendientes.filter(p => p.id !== id)
    },
    
    // Calendario semanal
    setCalendarioSemanal(state, calendario) {
      state.calendarioSemanal = calendario
    },
    
    actualizarCalendario(state, nuevoCalendario) {
      state.calendarioSemanal = nuevoCalendario
    },
    
    inicializarDiaCalendario(state, dia) {
      if (!state.calendarioSemanal[dia]) {
        state.calendarioSemanal[dia] = {
          manana: [],
          tarde: []
        }
      }
    },
    
    inicializarQuirofanoConSlots(state, { dia, turno, quirofano }) {
      if (!state.calendarioSemanal[dia]) {
        state.calendarioSemanal[dia] = {}
      }
      if (!state.calendarioSemanal[dia][turno]) {
        state.calendarioSemanal[dia][turno] = []
      }
      
      if (!state.calendarioSemanal[dia][turno][quirofano]) {
        state.calendarioSemanal[dia][turno][quirofano] = {
          slots: [null, null, null]
        }
      }
    },
    
    asignarPacienteASlot(state, { dia, turno, quirofano, slot, paciente }) {
      if (!state.calendarioSemanal[dia]) {
        state.calendarioSemanal[dia] = {}
      }
      if (!state.calendarioSemanal[dia][turno]) {
        state.calendarioSemanal[dia][turno] = []
      }
      if (!state.calendarioSemanal[dia][turno][quirofano]) {
        state.calendarioSemanal[dia][turno][quirofano] = {
          slots: [null, null, null]
        }
      } else if (!state.calendarioSemanal[dia][turno][quirofano].slots) {
        const pacienteExistente = state.calendarioSemanal[dia][turno][quirofano]
        state.calendarioSemanal[dia][turno][quirofano] = {
          slots: [pacienteExistente, null, null]
        }
      }
      
      state.calendarioSemanal[dia][turno][quirofano].slots[slot] = paciente
    },
    
    quitarPacienteDeSlot(state, { dia, turno, quirofano, slot }) {
      if (state.calendarioSemanal[dia] &&
          state.calendarioSemanal[dia][turno] &&
          state.calendarioSemanal[dia][turno][quirofano] &&
          state.calendarioSemanal[dia][turno][quirofano].slots) {
        state.calendarioSemanal[dia][turno][quirofano].slots[slot] = null
      }
    }
  },
  
  actions: {
    // Cargar datos iniciales
    async fetchInitialData({ dispatch }) {
      await Promise.all([
        dispatch('fetchConfiguracion'),
        dispatch('fetchPacientesUrgentes'),
        dispatch('fetchPacientesPresentar'),
        dispatch('fetchPacientesNoProgMedicacion'),
        dispatch('fetchPacientesNoProgPartesBlandas'),
        dispatch('fetchPacientesPendientes'),
        dispatch('fetchCalendarioSemanal')
      ])
    },
    
    // Configuración
    async fetchConfiguracion({ commit }) {
      commit('setLoading', true)
      commit('setError', null)
      
      try {
        const config = await getConfiguracion()
        commit('setConfiguracion', config)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al cargar configuración:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async saveConfiguracion({ commit }, nuevaConfig) {
      commit('setLoading', true)
      commit('setError', null)
      
      try {
        await updateConfiguracion('semanal', nuevaConfig)
        commit('actualizarConfiguracion', nuevaConfig)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al guardar configuración:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    // Pacientes urgentes
    async fetchPacientesUrgentes({ commit }) {
      commit('setLoading', true)
      
      try {
        const pacientes = await getPacientesByEstado('urgente')
        commit('setPacientesUrgentes', pacientes)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al cargar pacientes urgentes:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async addPacienteUrgente({ commit }, paciente) {
      commit('setLoading', true)
      
      try {
        const pacienteToSave = {
          ...paciente,
          estado: 'urgente'
        }
        
        const id = await addPaciente(pacienteToSave)
        commit('agregarPacienteUrgente', { id, ...pacienteToSave })
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al añadir paciente urgente:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async operarPacienteUrgente({ commit, dispatch }, { pacienteId, requiereSegunda }) {
      commit('setLoading', true)
      
      try {
        if (requiereSegunda) {
          // Actualizar estado y mover a no programables
          await updatePaciente(pacienteId, { 
            estado: 'noProgPartesBlandas',
            fechaPrimeraCirugia: new Date().toISOString().slice(0, 10),
            motivo: 'Pendiente evaluación post-cirugía'
          })
          
          // Eliminar de urgentes y actualizar ambas listas
          commit('eliminarPacienteUrgente', pacienteId)
          await dispatch('fetchPacientesNoProgPartesBlandas')
        } else {
          // Marcar como operado y archivar
          await updatePaciente(pacienteId, { estado: 'operado', fechaOperacion: new Date() })
          commit('eliminarPacienteUrgente', pacienteId)
        }
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al operar paciente urgente:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    // Pacientes para presentar
    async fetchPacientesPresentar({ commit }) {
      commit('setLoading', true)
      
      try {
        const pacientes = await getPacientesByEstado('presentar')
        commit('setPacientesPresentar', pacientes)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al cargar pacientes para presentar:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async addPacientePresentar({ commit }, paciente) {
      commit('setLoading', true)
      
      try {
        const pacienteToSave = {
          ...paciente,
          estado: 'presentar',
          fechaIngreso: new Date().toISOString()
        }
        
        const id = await addPaciente(pacienteToSave)
        commit('agregarPacientePresentar', { id, ...pacienteToSave })
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al añadir paciente para presentar:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async moverAPendientes({ commit, dispatch }, { pacienteId, origen }) {
      commit('setLoading', true)
      
      try {
        // Actualizar estado del paciente
        await updatePaciente(pacienteId, { 
          estado: 'pendiente',
          fechaListoParaProgramar: new Date().toISOString()
        })
        
        // Eliminar de la lista original
        if (origen === 'presentar') {
          commit('eliminarPacientePresentar', pacienteId)
        } else if (origen === 'noProgMedicacion') {
          commit('eliminarPacienteNoProgMedicacion', pacienteId)
        } else if (origen === 'noProgPartesBlandas') {
          commit('eliminarPacienteNoProgPartesBlandas', pacienteId)
        }
        
        // Actualizar lista de pendientes
        await dispatch('fetchPacientesPendientes')
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al mover paciente a pendientes:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async moverANoProgramables({ commit, dispatch }, { paciente, tipo }) {
      commit('setLoading', true)
      
      try {
        if (tipo === 'medicacion') {
          // Determinar tiempo restante según medicación
          let tiempoRestante = 0
          let medicacionNombre = ''
          
          // Antiagregantes
          if (paciente.medicacion?.aas) {
            tiempoRestante = 144 // 6 días en horas (promedio 5-7 días)
            medicacionNombre = 'Ácido Acetilsalicílico'
          } else if (paciente.medicacion?.clopidogrel) {
            tiempoRestante = 144 // 6 días en horas
            medicacionNombre = 'Clopidogrel'
          } else if (paciente.medicacion?.prasugrel) {
            tiempoRestante = 204 // 8.5 días en horas
            medicacionNombre = 'Prasugrel'
          } else if (paciente.medicacion?.ticagrelor) {
            tiempoRestante = 120 // 5 días en horas
            medicacionNombre = 'Ticagrelor'
          } 
          // Anticoagulantes
          else if (paciente.medicacion?.warfarina) {
            tiempoRestante = 120 // 5 días en horas
            medicacionNombre = 'Warfarina'
          } else if (paciente.medicacion?.dabigatran) {
            tiempoRestante = 48 // 2 días en horas
            medicacionNombre = 'Dabigatrán'
          } else if (paciente.medicacion?.rivaroxaban) {
            tiempoRestante = 48 // 2 días en horas
            medicacionNombre = 'Rivaroxabán'
          } else if (paciente.medicacion?.apixaban) {
            tiempoRestante = 48 // 2 días en horas
            medicacionNombre = 'Apixabán'
          } 
          // Otros
          else if (paciente.medicacion?.hbpm) {
            tiempoRestante = 12 // 12 horas
            medicacionNombre = 'HBPM'
          }
          
          await updatePaciente(paciente.id, {
            estado: 'noProgMedicacion',
            medicacion: medicacionNombre,
            tiempoRestante: tiempoRestante,
            fechaProyectadaDisponible: new Date(Date.now() + tiempoRestante * 60 * 60 * 1000).toISOString()
          })
          
          // Actualizar listas
          commit('eliminarPacientePresentar', paciente.id)
          await dispatch('fetchPacientesNoProgMedicacion')
        } 
        else if (tipo === 'partesBlandas') {
          await updatePaciente(paciente.id, {
            estado: 'noProgPartesBlandas',
            fechaPrimeraCirugia: new Date().toISOString().slice(0, 10),
            motivo: paciente.motivo || 'Pendiente de evaluación'
          })
          
          // Actualizar listas
          commit('eliminarPacientePresentar', paciente.id)
          await dispatch('fetchPacientesNoProgPartesBlandas')
        }
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al mover paciente a no programables:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    // Pacientes no programables por medicación
    async fetchPacientesNoProgMedicacion({ commit }) {
      commit('setLoading', true)
      
      try {
        const pacientes = await getPacientesByEstado('noProgMedicacion')
        commit('setPacientesNoProgMedicacion', pacientes)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al cargar pacientes no programables por medicación:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async actualizarTiempoMedicacion({ dispatch, state }) {
      // Pacientes con medicación: actualizar tiempos
      const pacientes = [...state.pacientesNoProgMedicacion]
      
      for (const paciente of pacientes) {
        if (paciente.tiempoRestante > 0) {
          try {
            // Reducir en 1 hora
            await updatePaciente(paciente.id, { 
              tiempoRestante: paciente.tiempoRestante - 1 
            })
            
            // Si llega a cero, podríamos notificar
            if (paciente.tiempoRestante === 1) { // será 0 después de la actualización
              console.log(`Paciente ${paciente.nombre || paciente.id} listo para programar`)
            }
          } catch (error) {
            console.error("Error al actualizar tiempo de medicación:", error)
          }
        }
      }
      
      // Recargar la lista completa
      await dispatch('fetchPacientesNoProgMedicacion')
    },
    
    // Pacientes no programables por partes blandas
    async fetchPacientesNoProgPartesBlandas({ commit }) {
      commit('setLoading', true)
      
      try {
        const pacientes = await getPacientesByEstado('noProgPartesBlandas')
        commit('setPacientesNoProgPartesBlandas', pacientes)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al cargar pacientes no programables por partes blandas:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    // Pacientes pendientes
    async fetchPacientesPendientes({ commit }) {
      commit('setLoading', true)
      
      try {
        const pacientes = await getPacientesByEstado('pendiente')
        commit('setPacientesPendientes', pacientes)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al cargar pacientes pendientes:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async updatePacientePendiente({ dispatch }, { pacienteId, datos }) {
      try {
        await updatePaciente(pacienteId, datos)
        // Recargar la lista de pendientes para reflejar los cambios
        await dispatch('fetchPacientesPendientes')
      } catch (error) {
        console.error("Error al actualizar paciente pendiente:", error)
        throw error;
      }
    },
    
    // Calendario semanal
    async fetchCalendarioSemanal({ commit }) {
      commit('setLoading', true)
      
      try {
        const calendario = await getCalendarioSemanal()
        commit('setCalendarioSemanal', calendario)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al cargar calendario semanal:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    async saveCalendarioSemanal({ commit, state }) {
      commit('setLoading', true)
      
      try {
        await updateCalendario('actual', state.calendarioSemanal)
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al guardar calendario semanal:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    // Algoritmo de programación
    async ejecutarAlgoritmo({ commit, state, dispatch }) {
      commit('setLoading', true)
      
      try {
        // Ordenar por prioridad y tiempo de espera
        const pacientesOrdenados = [...state.pacientesPendientes].sort((a, b) => {
          // Primero por prioridad si está definida
          if (a.prioridad && b.prioridad) {
            return a.prioridad - b.prioridad
          }
          // Después por fecha de ingreso
          return new Date(a.fechaIngreso) - new Date(b.fechaIngreso)
        })

        // Separar pacientes por tipo
        const pertrocantereas = pacientesOrdenados.filter(p => 
          p.tipoFractura === 'Cadera - Pertrocantérea'
        )

        const subtrocantereas = pacientesOrdenados.filter(p => 
          p.tipoFractura === 'Cadera - Subtrocantérea'
        )

        const subcapitales = pacientesOrdenados.filter(p => 
          p.tipoFractura === 'Cadera - Subcapital'
        )

        const otrosPacientes = pacientesOrdenados.filter(p => 
          !['Cadera - Pertrocantérea', 'Cadera - Subtrocantérea', 'Cadera - Subcapital'].includes(p.tipoFractura)
        )

        // Reiniciar calendario pero conservando formato con slots
        const nuevoCalendario = Array(7).fill().map(() => ({
          manana: [],
          tarde: []
        }))

        // Para cada día de la semana
        for (let dia = 0; dia < state.diasSemana.length; dia++) {
          // PARTE 1: Turno de tarde - fracturas de cadera siguiendo reglas específicas
          const quirofanosTarde = state.configuracion[dia].tarde

          // Inicializar quirófanos con slots
          for (let q = 0; q < quirofanosTarde; q++) {
            nuevoCalendario[dia].tarde.push({
              slots: [null, null, null]
            })

            // Intentar asignar pacientes según reglas específicas
            // Regla: nunca mezclar diferentes tipos de fracturas en el mismo quirófano
            if (q < quirofanosTarde && pertrocantereas.length >= 2) {
              // Regla: 2 pertrocantéreas por quirófano
              const paciente1 = pertrocantereas.shift()
              const paciente2 = pertrocantereas.shift()
              nuevoCalendario[dia].tarde[q].slots[0] = paciente1
              nuevoCalendario[dia].tarde[q].slots[1] = paciente2
              
              // Actualizar estado de los pacientes
              if (paciente1 && paciente2) {
                await updatePaciente(paciente1.id, { 
                  estado: 'programado', 
                  diaOperacion: dia, 
                  turnoOperacion: 'tarde', 
                  quirofanoOperacion: q,
                  slotOperacion: 0
                })
                await updatePaciente(paciente2.id, { 
                  estado: 'programado', 
                  diaOperacion: dia, 
                  turnoOperacion: 'tarde', 
                  quirofanoOperacion: q,
                  slotOperacion: 1
                })
              }
            } else if (q < quirofanosTarde && subcapitales.length >= 1) {
              // Regla: 1 subcapital por quirófano
              const paciente = subcapitales.shift()
              nuevoCalendario[dia].tarde[q].slots[0] = paciente
              if (paciente) {
                await updatePaciente(paciente.id, { 
                  estado: 'programado', 
                  diaOperacion: dia, 
                  turnoOperacion: 'tarde', 
                  quirofanoOperacion: q,
                  slotOperacion: 0
                })
              }
            } else if (q < quirofanosTarde && subtrocantereas.length >= 1) {
              // Regla: 1 subtrocantérea por quirófano
              const paciente = subtrocantereas.shift()
              nuevoCalendario[dia].tarde[q].slots[0] = paciente
              if (paciente) {
                await updatePaciente(paciente.id, { 
                  estado: 'programado', 
                  diaOperacion: dia, 
                  turnoOperacion: 'tarde', 
                  quirofanoOperacion: q,
                  slotOperacion: 0
                })
              }
            } else if (q < quirofanosTarde && pertrocantereas.length === 1) {
              // Caso especial: si solo queda 1 pertrocantérea
              const paciente = pertrocantereas.shift()
              nuevoCalendario[dia].tarde[q].slots[0] = paciente
              if (paciente) {
                await updatePaciente(paciente.id, { 
                  estado: 'programado', 
                  diaOperacion: dia, 
                  turnoOperacion: 'tarde', 
                  quirofanoOperacion: q,
                  slotOperacion: 0
                })
              }
            }
          }

          // PARTE 2: Turno de mañana - resto de pacientes (no fracturas de cadera)
          const quirofanosManana = state.configuracion[dia].manana

          // Inicializar quirófanos con slots
          for (let q = 0; q < quirofanosManana; q++) {
            nuevoCalendario[dia].manana.push({
              slots: [null, null, null]
            })

            // Asignar otros pacientes a la mañana (no fracturas de cadera)
            if (otrosPacientes.length > 0) {
              // Intentar llenar los slots con otros pacientes
              for (let slot = 0; slot < 3 && otrosPacientes.length > 0; slot++) {
                const paciente = otrosPacientes.shift()
                nuevoCalendario[dia].manana[q].slots[slot] = paciente
                if (paciente) {
                  await updatePaciente(paciente.id, { 
                    estado: 'programado', 
                    diaOperacion: dia, 
                    turnoOperacion: 'manana', 
                    quirofanoOperacion: q,
                    slotOperacion: slot
                  })
                }
              }
            }
          }
        }

        // Los pacientes que no se pudieron asignar se quedan en las listas
        // y seguirán apareciendo como pendientes

        // Actualizar el calendario en la base de datos
        await updateCalendario('actual', nuevoCalendario)
        
        // Actualizar el estado local
        commit('actualizarCalendario', nuevoCalendario)
        
        // Recargar pacientes pendientes (los que quedaron sin asignar y los nuevos)
        await dispatch('fetchPacientesPendientes')
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al ejecutar algoritmo:", error)
      } finally {
        commit('setLoading', false)
      }
    },
    
    // Resetear semana
    async resetSemana({ commit, dispatch }) {
      commit('setLoading', true)
      
      try {
        // Esta función moverá pacientes programados a histórico y limpiará el calendario
        await resetSemana()
        
        // Recargar los datos
        await dispatch('fetchInitialData')
      } catch (error) {
        commit('setError', error.message)
        console.error("Error al resetear semana:", error)
      } finally {
        commit('setLoading', false)
      }
    }
  }
})