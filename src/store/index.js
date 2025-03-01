import { createStore } from 'vuex'

export default createStore({

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

pacientesUrgentes: [

{ id: 1, nombre: 'José García', tipoFractura: 'Cadera - Pertrocantérea', detallesFractura: 'Intertrocantérea', edad: 75 },

{ id: 2, nombre: 'María López', tipoFractura: 'Cadera - Subcapital', edad: 82 }

],

pacientesPresentar: [

{ id: 3, nombre: 'Antonio Pérez', edad: 68, tipoFractura: 'Cadera - Subtrocantérea', fechaIngreso: '24/02/2025 10:30', estadoClinico: 'Estable' },

{ id: 4, nombre: 'Carmen Rodríguez', edad: 79, tipoFractura: 'Cadera - Pertrocantérea', detallesFractura: 'Basicervical', fechaIngreso: '24/02/2025 15:45', estadoClinico: 'Hipertensión controlada' },

{ id: 5, nombre: 'Francisco Martínez', edad: 71, tipoFractura: 'Cadera - Subcapital', fechaIngreso: '24/02/2025 18:20', estadoClinico: 'Diabetes tipo 2' }

],

pacientesNoProgMedicacion: [

{ id: 6, nombre: 'Lucía Sánchez', medicacion: 'Clopidogrel', tiempoRestante: 72, tipoFractura: 'Cadera - Pertrocantérea' },

{ id: 7, nombre: 'Manuel Jiménez', medicacion: 'AAS', tiempoRestante: 0, tipoFractura: 'Cadera - Subcapital' }

],

pacientesNoProgPartesBlandas: [

{ id: 8, nombre: 'Isabel Gómez', fechaPrimeraCirugia: '23/02/2025', motivo: 'Inflamación severa', tipoFractura: 'Cadera - Pertrocantérea' },

{ id: 9, nombre: 'Javier Fernández', fechaPrimeraCirugia: '22/02/2025', motivo: 'Hematoma extenso', tipoFractura: 'Cadera - Subtrocantérea' }

],

pacientesPendientes: [

{ id: 10, nombre: 'Dolores Ruiz', edad: 83, tipoFractura: 'Cadera - Pertrocantérea', fechaIngreso: '22/02/2025 09:15', estado: 'Listo', prioridad: 1 },

{ id: 11, nombre: 'Enrique Torres', edad: 70, tipoFractura: 'Cadera - Subcapital', fechaIngreso: '22/02/2025 14:30', estado: 'Listo', prioridad: 2 },

{ id: 12, nombre: 'Pilar Navarro', edad: 75, tipoFractura: 'Cadera - Subtrocantérea', fechaIngreso: '23/02/2025 10:45', estado: 'Listo', prioridad: 3 },

{ id: 13, nombre: 'Juan Rodríguez', edad: 62, tipoFractura: 'Pilón tibial', detallesFractura: 'Fractura bimaleolar', fechaIngreso: '21/02/2025 08:30', estado: 'Listo', prioridad: 4 },

{ id: 14, nombre: 'Ana Gómez', edad: 58, tipoFractura: 'Radio distal', detallesFractura: 'Fractura de Colles', fechaIngreso: '22/02/2025 16:20', estado: 'Listo', prioridad: 5 },

{ id: 15, nombre: 'Roberto Fernández', edad: 75, tipoFractura: 'Húmero proximal', detallesFractura: 'Fractura proximal', fechaIngreso: '23/02/2025 12:10', estado: 'Listo', prioridad: 6 }

],

calendarioSemanal: [

// Formato actualizado para soportar slots por quirófano

{

manana: [

{

slots: [

{ id: 10, nombre: 'Dolores Ruiz', tipoFractura: 'Cadera - Pertrocantérea' },

null,

null

]

},

{

slots: [

{ id: 11, nombre: 'Enrique Torres', tipoFractura: 'Cadera - Subcapital' },

null,

null

]

}

],

tarde: []

},

// Martes a Domingo (vacíos inicialmente)

{}, {}, {}, {}, {}, {}

]

},

mutations: {

actualizarConfiguracion(state, nuevaConfig) {

state.configuracion = nuevaConfig;

},

agregarPacienteUrgente(state, paciente) {

state.pacientesUrgentes.push({

id: Date.now(),

...paciente

});

},

eliminarPacienteUrgente(state, index) {

state.pacientesUrgentes.splice(index, 1);

},

agregarPacientePresentar(state, paciente) {

state.pacientesPresentar.push({

id: Date.now(),

fechaIngreso: new Date().toLocaleString(),

...paciente

});

},

eliminarPacientePresentar(state, index) {

state.pacientesPresentar.splice(index, 1);

},

moverAPendientes(state, { paciente, origen }) {

// Agregar a pendientes

state.pacientesPendientes.push({

...paciente,

estado: 'Listo',

prioridad: state.pacientesPendientes.length + 1

});

// Eliminar de la lista original

if (origen === 'presentar') {

state.pacientesPresentar = state.pacientesPresentar.filter(p => p.id !== paciente.id);

} else if (origen === 'noProgMedicacion') {

state.pacientesNoProgMedicacion = state.pacientesNoProgMedicacion.filter(p => p.id !== paciente.id);

} else if (origen === 'noProgPartesBlandas') {

state.pacientesNoProgPartesBlandas = state.pacientesNoProgPartesBlandas.filter(p => p.id !== paciente.id);

}

},

moverANoProgramables(state, { paciente, tipo }) {

if (tipo === 'medicacion') {

// Determinar tiempo restante según medicación

let tiempoRestante = 0;

let medicacion = '';

// Verificar anticoagulantes en orden de mayor a menor tiempo

if (paciente.medicacion && paciente.medicacion.warfarina) {

tiempoRestante = 120; // 5 días en horas

medicacion = 'Warfarina/Sintrom';

} else if (paciente.medicacion && paciente.medicacion.clopidogrel) {

tiempoRestante = 120; // 5 días en horas

medicacion = 'Clopidogrel';

} else if (paciente.medicacion && paciente.medicacion.doac) {

tiempoRestante = 48; // 2 días en horas

medicacion = 'DOAC';

} else if (paciente.medicacion && paciente.medicacion.hbpm) {

tiempoRestante = 12;

medicacion = 'HBPM';

} else if (paciente.medicacion && paciente.medicacion.aas) {

tiempoRestante = 24;

medicacion = 'AAS';

}

state.pacientesNoProgMedicacion.push({

id: paciente.id,

nombre: paciente.nombre,

medicacion: medicacion,

tiempoRestante: tiempoRestante,

tipoFractura: paciente.tipoFractura,

detallesFractura: paciente.detallesFractura

});

} else if (tipo === 'partesBlandas') {

state.pacientesNoProgPartesBlandas.push({

id: paciente.id,

nombre: paciente.nombre,

fechaPrimeraCirugia: new Date().toLocaleDateString(),

motivo: 'Pendiente de evaluación',

tipoFractura: paciente.tipoFractura,

detallesFractura: paciente.detallesFractura

});

}

// Eliminar de la lista original

state.pacientesPresentar = state.pacientesPresentar.filter(p => p.id !== paciente.id);

},

actualizarPacientesPendientes(state, nuevaLista) {

state.pacientesPendientes = nuevaLista;

},

actualizarCalendario(state, nuevoCalendario) {

state.calendarioSemanal = nuevoCalendario;

},

quitarPacientePendiente(state, index) {

state.pacientesPendientes.splice(index, 1);

},

agregarPacientePendiente(state, paciente) {

state.pacientesPendientes.push(paciente);

},

inicializarDiaCalendario(state, dia) {

if (!state.calendarioSemanal[dia]) {

state.calendarioSemanal[dia] = {

manana: [],

tarde: []

};

}

},

inicializarQuirofanoConSlots(state, { dia, turno, quirofano }) {

// Asegurarnos de que existe la estructura

if (!state.calendarioSemanal[dia]) {

state.calendarioSemanal[dia] = {};

}

if (!state.calendarioSemanal[dia][turno]) {

state.calendarioSemanal[dia][turno] = [];

}

// Asegurarnos de que existe el quirófano con slots

if (!state.calendarioSemanal[dia][turno][quirofano]) {

state.calendarioSemanal[dia][turno][quirofano] = {

slots: [null, null, null]

};

}

},

asignarPacienteASlot(state, { dia, turno, quirofano, slot, paciente }) {

// Asegurar que tenemos la estructura completa

if (!state.calendarioSemanal[dia]) {

state.calendarioSemanal[dia] = {};

}

if (!state.calendarioSemanal[dia][turno]) {

state.calendarioSemanal[dia][turno] = [];

}

if (!state.calendarioSemanal[dia][turno][quirofano]) {

state.calendarioSemanal[dia][turno][quirofano] = {

slots: [null, null, null]

};

} else if (!state.calendarioSemanal[dia][turno][quirofano].slots) {

// Migración de formato anterior a nuevo formato con slots

const pacienteExistente = state.calendarioSemanal[dia][turno][quirofano];

state.calendarioSemanal[dia][turno][quirofano] = {

slots: [pacienteExistente, null, null]

};

}

// Asignar el paciente al slot específico

state.calendarioSemanal[dia][turno][quirofano].slots[slot] = paciente;

},

quitarPacienteDeSlot(state, { dia, turno, quirofano, slot }) {

if (state.calendarioSemanal[dia] &&

state.calendarioSemanal[dia][turno] &&

state.calendarioSemanal[dia][turno][quirofano] &&

state.calendarioSemanal[dia][turno][quirofano].slots) {

// Vaciar el slot

state.calendarioSemanal[dia][turno][quirofano].slots[slot] = null;

}

}

},

actions: {

ejecutarAlgoritmo({ commit, state }) {

// Ordenar por prioridad y tiempo de espera

const pacientesOrdenados = [...state.pacientesPendientes].sort((a, b) => {

// Primero por prioridad si está definida

if (a.prioridad && b.prioridad) {

return a.prioridad - b.prioridad;

}

// Después por fecha de ingreso

return new Date(a.fechaIngreso) - new Date(b.fechaIngreso);

});

// Separar pacientes por tipo

const pertrocantereas = pacientesOrdenados.filter(p => 
  p.tipoFractura === 'Cadera - Pertrocantérea'
);

const subtrocantereas = pacientesOrdenados.filter(p => 
  p.tipoFractura === 'Cadera - Subtrocantérea'
);

const subcapitales = pacientesOrdenados.filter(p => 
  p.tipoFractura === 'Cadera - Subcapital'
);

const otrosPacientes = pacientesOrdenados.filter(p => 
  !['Cadera - Pertrocantérea', 'Cadera - Subtrocantérea', 'Cadera - Subcapital'].includes(p.tipoFractura)
);

// Reiniciar calendario pero conservando formato con slots

const nuevoCalendario = Array(7).fill().map(() => ({

manana: [],

tarde: []

}));

// Para cada día de la semana

for (let dia = 0; dia < state.diasSemana.length; dia++) {

// PARTE 1: Turno de tarde - fracturas de cadera siguiendo reglas específicas

const quirofanosTarde = state.configuracion[dia].tarde;

// Inicializar quirófanos con slots

for (let q = 0; q < quirofanosTarde; q++) {

nuevoCalendario[dia].tarde.push({

slots: [null, null, null]

});

// Intentar asignar pacientes según reglas específicas

// Regla: nunca mezclar diferentes tipos de fracturas en el mismo quirófano

if (q < quirofanosTarde && pertrocantereas.length >= 2) {

// Regla: 2 pertrocantéreas por quirófano

const paciente1 = pertrocantereas.shift();

const paciente2 = pertrocantereas.shift();

nuevoCalendario[dia].tarde[q].slots[0] = paciente1;

nuevoCalendario[dia].tarde[q].slots[1] = paciente2;

} else if (q < quirofanosTarde && subcapitales.length >= 1) {

// Regla: 1 subcapital por quirófano

const paciente = subcapitales.shift();

nuevoCalendario[dia].tarde[q].slots[0] = paciente;

} else if (q < quirofanosTarde && subtrocantereas.length >= 1) {

// Regla: 1 subtrocantérea por quirófano

const paciente = subtrocantereas.shift();

nuevoCalendario[dia].tarde[q].slots[0] = paciente;

} else if (q < quirofanosTarde && pertrocantereas.length === 1) {

// Caso especial: si solo queda 1 pertrocantérea

const paciente = pertrocantereas.shift();

nuevoCalendario[dia].tarde[q].slots[0] = paciente;

}

}

// PARTE 2: Turno de mañana - resto de pacientes (no fracturas de cadera)

const quirofanosManana = state.configuracion[dia].manana;

// Inicializar quirófanos con slots

for (let q = 0; q < quirofanosManana; q++) {

nuevoCalendario[dia].manana.push({

slots: [null, null, null]

});

// Asignar otros pacientes a la mañana (no fracturas de cadera)

if (otrosPacientes.length > 0) {

// Intentar llenar los slots con otros pacientes

for (let slot = 0; slot < 3 && otrosPacientes.length > 0; slot++) {

const paciente = otrosPacientes.shift(); // Tomar el primer paciente

nuevoCalendario[dia].manana[q].slots[slot] = paciente;

}

}

}

// Si todavía quedan pacientes de cadera, continuar asignándolos en el siguiente día

}

// Juntar los pacientes que no se pudieron asignar

const pacientesNoAsignados = [

...pertrocantereas,

...subtrocantereas,

...subcapitales,

...otrosPacientes

];

// Actualizar el listado de pacientes pendientes con los que no se pudieron asignar

commit('actualizarPacientesPendientes', pacientesNoAsignados);

// Actualizar el calendario

commit('actualizarCalendario', nuevoCalendario);

}

}

})