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
    // Cargar datos iniciales - Versión mejorada con mejor manejo de errores y secuencia
    async fetchInitialData({ dispatch }) {
      console.log("Iniciando carga de datos iniciales...");
      
      try {
        // Track load status
        let configLoaded = false;
        
        // Intentar cargar la configuración primero con reintentos
        try {
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`Intento ${attempt} de cargar configuración...`);
              await dispatch('fetchConfiguracion');
              console.log("Configuración cargada correctamente");
              configLoaded = true;
              break;
            } catch (configError) {
              console.error(`Error en intento ${attempt} de cargar configuración:`, configError);
              if (attempt < 3) {
                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 300 * attempt));
              }
            }
          }
          
          if (!configLoaded) {
            console.warn("No se pudo cargar la configuración después de múltiples intentos");
          }
        } catch (configError) {
          console.error('Error general al cargar configuración:', configError);
        }
        
        // Carga paralela de los datos de pacientes para optimizar el tiempo
        const loadPromises = [
          dispatch('fetchPacientesUrgentes').catch(error => {
            console.error('Error cargando pacientes urgentes:', error);
            return null;
          }),
          
          dispatch('fetchPacientesPresentar').catch(error => {
            console.error('Error cargando pacientes para presentar:', error);
            return null;
          }),
          
          dispatch('fetchPacientesNoProgMedicacion').catch(error => {
            console.error('Error cargando pacientes no programables por medicación:', error);
            return null;
          }),
          
          dispatch('fetchPacientesNoProgPartesBlandas').catch(error => {
            console.error('Error cargando pacientes no programables por partes blandas:', error);
            return null;
          }),
          
          dispatch('fetchPacientesPendientes').catch(error => {
            console.error('Error cargando pacientes pendientes:', error);
            return null;
          }),
          
          dispatch('fetchCalendarioSemanal').catch(error => {
            console.error('Error cargando calendario semanal:', error);
            return null;
          })
        ];
        
        // Esperar a que todas las promesas se resuelvan (incluso si algunas fallan)
        await Promise.allSettled(loadPromises);
        
        // Determinar si hubo algún error en la carga
        const allSuccess = loadPromises.every(p => p !== null);
        
        // Notificar éxito o error parcial
        if (allSuccess && configLoaded) {
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
        
        console.log("Carga de datos iniciales completada");
      } catch (error) {
        console.error('Error general cargando datos iniciales:', error);
        // Notificar error
        dispatch('notify', {
          message: 'Error al cargar datos: ' + (error.message || 'Error desconocido'),
          type: 'error'
        });
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