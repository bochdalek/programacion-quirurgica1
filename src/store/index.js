// src/store/index.js (actualizado)
import { createStore } from 'vuex'
import authModule from './auth'
import patientsModule from './patients'
import calendarModule from './calendar'
import appModule from './app'

// Función auxiliar para guardar estado en localStorage
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify({
      patients: state.patients,
      calendar: state.calendar
    });
    localStorage.setItem('app_state', serializedState);
  } catch (error) {
    console.error('Error guardando estado en localStorage:', error);
  }
};

// Creación del store
const store = createStore({
  modules: {
    auth: authModule,
    patients: patientsModule,
    calendar: calendarModule,
    app: appModule
  },
  
  actions: {
    // Cargar datos iniciales
    async fetchInitialData({ dispatch }) {
      try {
        await Promise.all([
          dispatch('fetchConfiguracion'),
          dispatch('fetchPacientesUrgentes'),
          dispatch('fetchPacientesPresentar'),
          dispatch('fetchPacientesNoProgMedicacion'),
          dispatch('fetchPacientesNoProgPartesBlandas'),
          dispatch('fetchPacientesPendientes'),
          dispatch('fetchCalendarioSemanal')
        ]);
        // Notificar éxito
        dispatch('notify', {
          message: 'Datos cargados correctamente',
          type: 'success'
        });
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        // Notificar error
        dispatch('notify', {
          message: 'Error al cargar datos: ' + error.message,
          type: 'error'
        });
      }
    },
    
    // Cargar estado desde localStorage (opcional para uso futuro)
    loadSavedState() {
      try {
        const serializedState = localStorage.getItem('app_state');
        if (serializedState !== null) {
          const savedState = JSON.parse(serializedState);
          
          // Aquí podríamos restaurar el estado si lo necesitáramos
          console.log('Estado cargado desde localStorage', savedState);
          
          // Por ahora, no hacemos nada con el estado cargado
          // Si necesitamos usarlo en el futuro, podríamos hacer:
          // commit('setEstadoGuardado', savedState);
        }
      } catch (error) {
        console.error('Error cargando estado desde localStorage:', error);
      }
    }
  }
});

// Suscribir función para guardar el estado en localStorage después de cada cambio
store.subscribe((mutation, state) => {
  // Solo guardar si no es una mutación relacionada con carga o UI
  if (!mutation.type.includes('setLoading') && 
      !mutation.type.includes('setError') &&
      !mutation.type.includes('Notification')) {
    saveStateToLocalStorage(state);
  }
});

export default store;