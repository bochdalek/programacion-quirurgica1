// src/store/index.js (improved and ESLint fixed)
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
      console.log("Iniciando carga de datos iniciales...");
      
      try {
        // Track load status
        let loadSuccess = true;
        
        // Load configuration first - most important
        try {
          await dispatch('fetchConfiguracion');
          console.log("Configuración cargada correctamente");
        } catch (configError) {
          console.error('Error cargando configuración:', configError);
          loadSuccess = false;
        }
        
        // Load patient data - wrapped in try/catch blocks to continue even if some fail
        try {
          await dispatch('fetchPacientesUrgentes');
        } catch (error) {
          console.error('Error cargando pacientes urgentes:', error);
          loadSuccess = false;
        }
        
        try {
          await dispatch('fetchPacientesPresentar');
        } catch (error) {
          console.error('Error cargando pacientes para presentar:', error);
          loadSuccess = false;
        }
        
        try {
          await dispatch('fetchPacientesNoProgMedicacion');
        } catch (error) {
          console.error('Error cargando pacientes no programables por medicación:', error);
          loadSuccess = false;
        }
        
        try {
          await dispatch('fetchPacientesNoProgPartesBlandas');
        } catch (error) {
          console.error('Error cargando pacientes no programables por partes blandas:', error);
          loadSuccess = false;
        }
        
        try {
          await dispatch('fetchPacientesPendientes');
        } catch (error) {
          console.error('Error cargando pacientes pendientes:', error);
          loadSuccess = false;
        }
        
        try {
          await dispatch('fetchCalendarioSemanal');
        } catch (error) {
          console.error('Error cargando calendario semanal:', error);
          loadSuccess = false;
        }
        
        // Notificar éxito o error parcial
        if (loadSuccess) {
          dispatch('notify', {
            message: 'Datos cargados correctamente',
            type: 'success'
          });
        } else {
          dispatch('notify', {
            message: 'Algunos datos no pudieron cargarse completamente. La aplicación puede funcionar con limitaciones.',
            type: 'warning'
          });
        }
        
        console.log("Carga de datos iniciales completada", loadSuccess ? "con éxito" : "con algunos errores");
      } catch (error) {
        console.error('Error general cargando datos iniciales:', error);
        // Notificar error
        dispatch('notify', {
          message: 'Error al cargar datos: ' + (error.message || 'Error desconocido'),
          type: 'error'
        });
        
        // Even in case of error, return success to allow the app to continue
        return true;
      }
      
      return true;
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