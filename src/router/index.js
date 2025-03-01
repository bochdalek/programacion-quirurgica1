import { createRouter, createWebHistory } from 'vue-router'
import ConfiguracionSemanal from '../components/ConfiguracionSemanal.vue'
import RegistroGuardia from '../components/RegistroGuardia.vue'
import ListaPresentar from '../components/ListaPresentar.vue'
import PacientesNoProgramables from '../components/PacientesNoProgramables.vue'
import PacientesPendientes from '../components/PacientesPendientes.vue'
import CalendarioSemanal from '../components/CalendarioSemanal.vue'
import InformesEstadisticos from '../components/InformesEstadisticos.vue'
import PlanificacionQuirofanos from '../components/PlanificacionQuirofanos.vue'

const routes = [
  { path: '/', redirect: '/configuracion' },
  { path: '/configuracion', component: ConfiguracionSemanal },
  { path: '/guardia', component: RegistroGuardia },
  { path: '/presentar', component: ListaPresentar },
  { path: '/noprogramables', component: PacientesNoProgramables },
  { path: '/pendientes', component: PacientesPendientes },
  { path: '/calendario', component: CalendarioSemanal },
  { path: '/reportes', component: InformesEstadisticos },
  { path: '/planificacion', component: PlanificacionQuirofanos }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router