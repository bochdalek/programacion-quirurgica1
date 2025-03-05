// src/store/app.js - Módulo corregido

const appModule = {
  state: {
    isLoading: false,
    error: null,
    notifications: []
  },

  mutations: {
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
    
    setError(state, error) {
      state.error = error;
    },
    
    addNotification(state, notification) {
      // Asegurar que state.notifications es un array
      if (!Array.isArray(state.notifications)) {
        state.notifications = [];
      }
      
      // Generamos un ID único para la notificación
      const id = notification.id || Date.now() + Math.random().toString(36).substr(2, 9);
      state.notifications.push({
        id,
        message: notification.message || 'Notificación del sistema',
        type: notification.type || 'info', // info, success, warning, error
        timeout: notification.timeout || 5000, // Tiempo en milisegundos
        timestamp: new Date()
      });
    },
    
    removeNotification(state, notificationId) {
      // Asegurar que state.notifications es un array
      if (!Array.isArray(state.notifications)) {
        state.notifications = [];
        return;
      }
      
      const index = state.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        state.notifications.splice(index, 1);
      }
    },
    
    clearNotifications(state) {
      state.notifications = [];
    }
  },

  actions: {
    notify({ commit }, notification) {
      try {
        // Validar que notification es un objeto
        if (typeof notification !== 'object' || notification === null) {
          console.error('La notificación debe ser un objeto:', notification);
          return;
        }
        
        // Asegurar que la notificación tiene un mensaje
        if (!notification.message) {
          console.warn('La notificación no tiene mensaje:', notification);
          notification.message = 'Notificación del sistema';
        }
        
        const notificationWithId = { 
          ...notification,
          id: notification.id || Date.now() + Math.random().toString(36).substr(2, 9)
        };
        
        commit('addNotification', notificationWithId);
        
        // Si tiene un timeout, programamos su eliminación automática
        if (notification.timeout !== 0) {
          setTimeout(() => {
            commit('removeNotification', notificationWithId.id);
          }, notification.timeout || 5000);
        }
        
        return notificationWithId.id;
      } catch (error) {
        console.error('Error al añadir notificación:', error);
      }
    },
    
    // Nueva acción para manejar errores de forma centralizada
    handleError({ commit, dispatch }, { error, source }) {
      console.error(`Error en ${source || 'desconocido'}:`, error);
      
      const errorMessage = error?.message || 'Error desconocido';
      commit('setError', errorMessage);
      
      dispatch('notify', {
        message: `Error: ${errorMessage}`,
        type: 'error',
        timeout: 8000 // Mostrar por más tiempo los errores
      });
    }
  }
};

export default appModule;