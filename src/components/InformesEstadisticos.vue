<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">Informes y Estadísticas</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded shadow border">
        <h3 class="text-lg font-bold mb-3">Ocupación de Quirófanos</h3>
        <!-- Aquí iría un gráfico -->
        <div class="h-64 bg-gray-100 flex items-center justify-center">
          <p class="text-gray-500">Gráfico de ocupación semanal</p>
        </div>
        <div class="mt-2">
          <p class="text-sm text-gray-600">Muestra la tasa de ocupación de los quirófanos disponibles para cada día de la semana.</p>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded shadow border">
        <h3 class="text-lg font-bold mb-3">Tiempos de Espera</h3>
        <!-- Aquí iría un gráfico -->
        <div class="h-64 bg-gray-100 flex items-center justify-center">
          <p class="text-gray-500">Gráfico de tiempos de espera</p>
        </div>
        <div class="mt-2">
          <p class="text-sm text-gray-600">Análisis de los tiempos de espera promedio por tipo de fractura y prioridad.</p>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded shadow border">
        <h3 class="text-lg font-bold mb-3">Distribución por Tipo de Fractura</h3>
        <!-- Aquí iría un gráfico -->
        <div class="h-64 bg-gray-100 flex items-center justify-center">
          <p class="text-gray-500">Gráfico de distribución por tipo</p>
        </div>
        <div class="mt-2">
          <p class="text-sm text-gray-600">Muestra la proporción de cada tipo de fractura en el total de pacientes atendidos.</p>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded shadow border">
        <h3 class="text-lg font-bold mb-3">Estadísticas Generales</h3>
        <div class="space-y-2">
          <div class="flex justify-between border-b pb-1">
            <span>Total de Pacientes:</span>
            <span>{{ totalPacientes }}</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span>Tiempo Medio de Espera:</span>
            <span>{{ tiempoMedioEspera }} horas</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span>Pacientes Programados:</span>
            <span>{{ pacientesProgramados }}</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span>Pacientes No Programables:</span>
            <span>{{ pacientesNoProgramables }}</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span>Pacientes Pendientes:</span>
            <span>{{ pacientesPendientes.length }}</span>
          </div>
          <div class="flex justify-between pb-1">
            <span>Eficiencia Quirófanos:</span>
            <span>{{ eficienciaQuirofanos }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6">
      <h3 class="text-lg font-bold mb-3">Generar Reportes</h3>
      <div class="flex space-x-4">
        <button @click="generarReporteSemanal" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Reporte Semanal
        </button>
        <button @click="generarReporteMensual" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Reporte Mensual
        </button>
        <button @click="exportarDatos" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          Exportar Datos
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'InformesEstadisticos',
  data() {
    return {
      tiempoMedioEspera: 32, // Datos de ejemplo
      pacientesProgramados: 28,
      eficienciaQuirofanos: 87
    }
  },
  computed: {
    ...mapState(['pacientesUrgentes', 'pacientesPresentar', 'pacientesNoProgMedicacion', 'pacientesNoProgPartesBlandas', 'pacientesPendientes']),
    ...mapState({
      authState: state => state.auth
    }),
    // Se mantiene el método pero ahora siempre devuelve true
    esProgramador() {
      // Temporalmente devolvemos true mientras no se implementen los roles
      return true;
    },
    totalPacientes() {
      return this.pacientesUrgentes.length + 
             this.pacientesPresentar.length + 
             this.pacientesNoProgMedicacion.length + 
             this.pacientesNoProgPartesBlandas.length + 
             this.pacientesPendientes.length;
    },
    pacientesNoProgramables() {
      return this.pacientesNoProgMedicacion.length + this.pacientesNoProgPartesBlandas.length;
    }
  },
  methods: {
    generarReporteSemanal() {
      // Ya no verificamos permisos mientras se implementan los roles
      alert('Generando reporte semanal...');
      // Aquí se implementaría la lógica para generar el reporte
      setTimeout(() => {
        alert('Reporte semanal generado correctamente.');
      }, 1500);
    },
    generarReporteMensual() {
      // Ya no verificamos permisos mientras se implementan los roles
      alert('Generando reporte mensual...');
      // Aquí se implementaría la lógica para generar el reporte
      setTimeout(() => {
        alert('Reporte mensual generado correctamente.');
      }, 2000);
    },
    exportarDatos() {
      // Ya no verificamos permisos mientras se implementan los roles
      alert('Exportando datos...');
      // Aquí se implementaría la lógica para exportar los datos
      setTimeout(() => {
        alert('Datos exportados correctamente. El archivo se ha descargado.');
      }, 1800);
    }
  }
}
</script>