// src/store/app.js

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
        // Generamos un ID único para la notificación
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        state.notifications.push({
          id,
          message: notification.message,
          type: notification.type || 'info', // info, success, warning, error
          timeout: notification.timeout || 5000, // Tiempo en milisegundos
          timestamp: new Date()
        });
      },
      
      removeNotification(state, notificationId) {
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
        commit('addNotification', notification);
        
        // Si tiene un timeout, programamos su eliminación automática
        if (notification.timeout !== 0) {
          setTimeout(() => {
            commit('removeNotification', notification.id);
          }, notification.timeout || 5000);
        }
      }
    }
  };
  
  export default appModule;