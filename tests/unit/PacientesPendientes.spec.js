import { shallowMount } from '@vue/test-utils';
import PacientesPendientes from '@/components/PacientesPendientes.vue';
import { createStore } from 'vuex';

// Mock del store
const createVuexStore = (pacientesPendientes = []) => {
  return createStore({
    state: {
      pacientesPendientes
    },
    actions: {
      ejecutarAlgoritmo: jest.fn()
    },
    mutations: {
      actualizarPacientesPendientes: jest.fn(),
      quitarPacientePendiente: jest.fn()
    }
  });
};

// Mocks globales
global.confirm = jest.fn();
global.alert = jest.fn();

describe('PacientesPendientes.vue', () => {
  // Reset de mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm.mockReset();
    global.alert.mockReset();
  });
  
  it('muestra mensaje cuando no hay pacientes pendientes', () => {
    // Arrange
    const store = createVuexStore([]);
    
    // Act
    const wrapper = shallowMount(PacientesPendientes, {
      global: {
        plugins: [store],
        stubs: ['router-link']
      }
    });
    
    // Assert
    expect(wrapper.text()).toContain('No hay pacientes pendientes de programación');
  });
  
  it('muestra los pacientes pendientes cuando existen', () => {
    // Arrange
    const pacientesPendientes = [
      { 
        nombre: 'Juan Pérez', 
        edad: 65, 
        tipoFractura: 'Cadera - Pertrocantérea',
        fechaIngreso: '2025-02-15',
        estado: 'Pendiente'
      }
    ];
    
    const store = createVuexStore(pacientesPendientes);
    
    // Act
    const wrapper = shallowMount(PacientesPendientes, {
      global: {
        plugins: [store],
        stubs: ['router-link']
      }
    });
    
    // Assert
    expect(wrapper.text()).toContain('Juan Pérez');
    expect(wrapper.text()).toContain('Cadera - Pertrocantérea');
    expect(wrapper.find('button.bg-blue-600').exists()).toBe(true);
  });
  
  it('llama a la acción ejecutarAlgoritmo cuando se hace clic en el botón', async () => {
    // Arrange
    const pacientesPendientes = [
      { 
        nombre: 'Juan Pérez', 
        edad: 65, 
        tipoFractura: 'Cadera - Pertrocantérea',
        fechaIngreso: '2025-02-15',
        estado: 'Pendiente'
      }
    ];
    
    const store = createVuexStore(pacientesPendientes);
    store.dispatch = jest.fn();
    
    const wrapper = shallowMount(PacientesPendientes, {
      global: {
        plugins: [store],
        stubs: ['router-link']
      }
    });
    
    // Mock de window.confirm
    global.confirm.mockReturnValue(true);
    
    // Act
    await wrapper.find('button.bg-blue-600').trigger('click');
    
    // Assert
    expect(store.dispatch).toHaveBeenCalledWith('ejecutarAlgoritmo');
  });
  
  it('no ejecuta el algoritmo si no hay pacientes pendientes', async () => {
    // Arrange
    const store = createVuexStore([]);
    store.dispatch = jest.fn();
    
    const wrapper = shallowMount(PacientesPendientes, {
      global: {
        plugins: [store],
        stubs: ['router-link']
      }
    });
    
    // Mock de window.alert
    global.alert.mockImplementation(() => {});
    
    // Act
    await wrapper.find('button.bg-blue-600').trigger('click');
    
    // Assert
    expect(global.alert).toHaveBeenCalledWith('No hay pacientes pendientes para programar.');
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});