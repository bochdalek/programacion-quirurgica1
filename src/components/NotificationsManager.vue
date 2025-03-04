<template>
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <transition-group name="notification">
        <div 
          v-for="notification in safeNotifications" 
          :key="notification.id"
          :class="[
            'p-4 rounded shadow-lg border flex items-start',
            notificationClass(notification.type)
          ]"
        >
          <div class="mr-2">
            <!-- Icono según el tipo de notificación -->
            <svg v-if="notification.type === 'success'" class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else-if="notification.type === 'warning'" class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p>{{ notification.message }}</p>
          </div>
          <button 
            @click="closeNotification(notification.id)" 
            class="ml-2 text-gray-400 hover:text-gray-600"
          >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </transition-group>
    </div>
  </template>
  
  <script>
  /* eslint-disable no-unused-vars */
  export default {
    name: 'NotificationsManager',
    computed: {
      // Uso una computada intermedia para asegurar que siempre tenemos un array
      safeNotifications() {
        // Accedemos de forma segura a las notificaciones
        const notifications = this.$store?.state?.app?.notifications;
        return Array.isArray(notifications) ? notifications : [];
      }
    },
    methods: {
      notificationClass(type) {
        switch (type) {
          case 'success':
            return 'bg-green-50 border-green-200 text-green-800';
          case 'error':
            return 'bg-red-50 border-red-200 text-red-800';
          case 'warning':
            return 'bg-yellow-50 border-yellow-200 text-yellow-800';
          default:
            return 'bg-blue-50 border-blue-200 text-blue-800';
        }
      },
      closeNotification(id) {
        if (this.$store && typeof this.$store.commit === 'function') {
          this.$store.commit('removeNotification', id);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .notification-enter-active, .notification-leave-active {
    transition: all 0.3s ease;
  }
  .notification-enter-from, .notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  </style>