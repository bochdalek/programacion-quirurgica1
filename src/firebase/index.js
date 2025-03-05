// src/firebase/index.js - Versión corregida
import { initializeApp } from 'firebase/app'
import { 
  getFirestore, collection, doc, getDoc, getDocs, 
  setDoc, updateDoc, deleteDoc, query, where,
  serverTimestamp, Timestamp
} from 'firebase/firestore'
import { 
  getAuth, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from 'firebase/auth'
import { firebaseConfig } from './config'

// Forzar el uso de almacenamiento local para desarrollo o cuando hay errores de Firestore
const simulateLocalStorage = true; // Always use localStorage for development and when Firestore is blocked

// Funciones de ayuda para localStorage
const getLocalCollection = (collectionName) => {
  try {
    const data = localStorage.getItem(`dev_${collectionName}`);
    if (!data) {
      // If no data exists, initialize with empty array
      console.log(`Inicializando colección vacía para ${collectionName}`);
      localStorage.setItem(`dev_${collectionName}`, JSON.stringify([]));
      return [];
    }

    // Intentamos parsear los datos
    try {
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (parseError) {
      console.error(`Error al parsear colección ${collectionName}:`, parseError);
      // Si hay error al parsear, inicializar con array vacío
      localStorage.setItem(`dev_${collectionName}`, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error(`Error al leer colección ${collectionName} de localStorage:`, error);
    return [];
  }
};

const saveLocalCollection = (collectionName, data) => {
  try {
    // Validar que data sea un objeto válido
    if (data === undefined || data === null) {
      console.error(`Error: Intentando guardar datos undefined/null en ${collectionName}`);
      return;
    }

    console.log(`Guardando colección ${collectionName} en localStorage:`, data);
    
    // Intentar serializar y guardar
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(`dev_${collectionName}`, serializedData);
    } catch (serializeError) {
      console.error(`Error al serializar datos para ${collectionName}:`, serializeError);
    }
  } catch (error) {
    console.error(`Error al guardar colección ${collectionName} en localStorage:`, error);
  }
};

const generateId = () => {
  return 'dev-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Colecciones
const usersCollection = collection(db, 'users')
const configuracionCollection = collection(db, 'configuracion')
const pacientesCollection = collection(db, 'pacientes')
const calendarioCollection = collection(db, 'calendario')

// Método para garantizar que la configuración exista en localStorage
const ensureConfigurationExists = () => {
  try {
    const defaultConfig = [
      { manana: 2, tarde: 2 }, // Lunes
      { manana: 2, tarde: 2 }, // Martes
      { manana: 2, tarde: 2 }, // Miércoles
      { manana: 2, tarde: 2 }, // Jueves
      { manana: 2, tarde: 2 }, // Viernes
      { manana: 1, tarde: 1 }, // Sábado
      { manana: 1, tarde: 1 }  // Domingo
    ];
    
    // Obtener la configuración actual
    const currentConfig = getLocalCollection('configuracion');
    
    // Si no hay configuración o es inválida, guardar la configuración por defecto
    if (!currentConfig || !Array.isArray(currentConfig) || currentConfig.length === 0) {
      console.log('[DEV] Guardando configuración por defecto en localStorage');
      saveLocalCollection('configuracion', defaultConfig);
      return defaultConfig;
    }
    
    return currentConfig;
  } catch (error) {
    console.error("Error al asegurar la existencia de la configuración:", error);
    const defaultConfig = [
      { manana: 2, tarde: 2 }, // Lunes
      { manana: 2, tarde: 2 }, // Martes
      { manana: 2, tarde: 2 }, // Miércoles
      { manana: 2, tarde: 2 }, // Jueves
      { manana: 2, tarde: 2 }, // Viernes
      { manana: 1, tarde: 1 }, // Sábado
      { manana: 1, tarde: 1 }  // Domingo
    ];
    saveLocalCollection('configuracion', defaultConfig);
    return defaultConfig;
  }
};

// Métodos de autenticación
const loginWithEmail = async (email, password) => {
  try {
    // Para entorno de desarrollo, aceptamos credenciales específicas
    if (process.env.NODE_ENV !== 'production') {
      // Simulación simplificada para desarrollo
      const username = email.split('@')[0];
      
      // Verificar credenciales simples para desarrollo
      if (
        (username === 'admin@example.com' && password === 'admin123') ||
        (username === 'prog@example.com' && password === 'prog123') ||
        (username === 'trauma@example.com' && password === 'trauma123') ||
        (username === 'enf@example.com' && password === 'enf123') ||
        // Versiones sin @example.com
        (username === 'admin' && password === 'admin123') ||
        (username === 'prog' && password === 'prog123') ||
        (username === 'trauma' && password === 'trauma123') ||
        (username === 'enf' && password === 'enf123')
      ) {
        console.log("Login simulado exitoso para desarrollo");
        // Simulamos un objeto user con el método getIdToken para desarrollo
        return {
          uid: username,
          email: email,
          // Añadir método getIdToken simulado
          getIdToken: () => Promise.resolve('dev-token-' + Date.now())
        };
      }
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error en login:", error)
    throw error
  }
}

const logout = () => {
  return signOut(auth)
}

// Obtener datos del usuario autenticado
const getUserData = async (uid) => {
    console.log("Buscando datos de usuario con UID:", uid);
    try {
      const userDoc = await getDoc(doc(usersCollection, uid));
      console.log("Referencia del documento:", doc(usersCollection, uid).path);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Datos de usuario encontrados:", userData);
        return { id: userDoc.id, ...userData };
      } else {
        console.error("No se encontró documento de usuario para UID:", uid);
        
        // Simulación para ambiente de desarrollo (eliminar en producción)
        // Esto permite trabajar sin una base de datos Firebase completamente configurada
        if (process.env.NODE_ENV !== 'production') {
          console.log("Ambiente de desarrollo detectado, generando datos de usuario simulados");
          // Determinar el rol basado en el UID o email
          let role = 'user';
          
          // Este código es solo para desarrollo y pruebas
          if (uid.includes('admin')) {
            role = 'admin';
          } else if (uid.includes('prog')) {
            role = 'programador';
          } else if (uid.includes('trauma')) {
            role = 'traumatologo';
          } else if (uid.includes('enf')) {
            role = 'enfermeria';
          }
          
          const simulatedUser = {
            id: uid,
            name: uid.split('@')[0],
            email: `${uid}@example.com`,
            role: role
          };
          
          console.log("Datos de usuario simulados:", simulatedUser);
          return simulatedUser;
        }
        
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error("Error al obtener datos de usuario:", error.message);
      throw error;
    }
};

// Improved getConfiguracion with more resilient error handling
const getConfiguracion = async () => {
  try {
    if (simulateLocalStorage) {
      console.log('[DEV] Obteniendo configuración desde localStorage');
      // Asegurar que siempre exista una configuración válida
      return ensureConfigurationExists();
    }

    // Firebase fallback
    try {
      const configSnapshot = await getDocs(configuracionCollection)
      const config = {}
      
      configSnapshot.forEach((doc) => {
        config[doc.id] = doc.data()
      })
      
      return config
    } catch (firebaseError) {
      console.error("Error al obtener configuración desde Firebase, usando localStorage:", firebaseError);
      
      // Si falla Firebase, usar ensureConfigurationExists para garantizar datos válidos
      return ensureConfigurationExists();
    }
  } catch (error) {
    console.error("Error general al obtener configuración:", error);
    // Retornar configuración por defecto en caso de error
    const defaultConfig = [
      { manana: 2, tarde: 2 },
      { manana: 2, tarde: 2 },
      { manana: 2, tarde: 2 },
      { manana: 2, tarde: 2 },
      { manana: 2, tarde: 2 },
      { manana: 1, tarde: 1 },
      { manana: 1, tarde: 1 }
    ];
    saveLocalCollection('configuracion', defaultConfig);
    return defaultConfig;
  }
};

const updateConfiguracion = async (id, data) => {
  try {
    if (simulateLocalStorage) {
      console.log(`[DEV] Actualizando configuración en localStorage`);
      // Simplemente guardar la configuración directamente
      saveLocalCollection('configuracion', data);
      return true;
    }

    try {
      await setDoc(doc(configuracionCollection, id), { 
        ...data, 
        updatedAt: serverTimestamp() 
      });
      return true;
    } catch (firebaseError) {
      console.error("Error al actualizar configuración en Firebase, usando localStorage:", firebaseError);
      // Si falla Firebase, guardar en localStorage
      saveLocalCollection('configuracion', data);
      return true;
    }
  } catch (error) {
    console.error("Error general al actualizar configuración:", error);
    throw error;
  }
};

// Método mejorado para obtener el calendario
const getCalendarioSemanal = async () => {
  try {
    if (simulateLocalStorage) {
      console.log('[DEV] Obteniendo calendario desde localStorage');
      const calendario = getLocalCollection('calendario');
      
      // Si el calendario está vacío o no existe, inicializar con estructura básica
      if (!calendario || !Array.isArray(calendario) || calendario.length === 0) {
        console.log('[DEV] Calendario no encontrado o vacío, inicializando con estructura básica');
        const calendarioVacio = Array(7).fill().map(() => ({
          manana: [],
          tarde: []
        }));
        saveLocalCollection('calendario', calendarioVacio);
        return calendarioVacio;
      }
      
      return calendario;
    }

    // Código original para Firebase
    try {
      const calendarSnapshot = await getDocs(calendarioCollection)
      const calendario = []
      
      calendarSnapshot.forEach((doc) => {
        calendario.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      if (calendario.length === 0) {
        // Si no hay datos, inicializar con estructura básica
        const calendarioVacio = Array(7).fill().map(() => ({
          manana: [],
          tarde: []
        }));
        
        // No hacemos await porque no necesitamos esperar a que se guarde
        updateCalendario('actual', calendarioVacio).catch(error => 
          console.error("Error al inicializar calendario vacío:", error)
        );
        
        return calendarioVacio;
      }
      
      return calendario;
    } catch (firebaseError) {
      console.error("Error al obtener calendario desde Firebase, usando localStorage:", firebaseError);
      return getLocalCollection('calendario') || Array(7).fill().map(() => ({
        manana: [],
        tarde: []
      }));
    }
  } catch (error) {
    console.error("Error general al obtener calendario:", error);
    // Devolver estructura básica en caso de error
    const calendarioVacio = Array(7).fill().map(() => ({
      manana: [],
      tarde: []
    }));
    return calendarioVacio;
  }
};

const updateCalendario = async (id, data) => {
  try {
    // Validar que el ID no esté vacío
    if (!id) {
      console.error("Error: ID de calendario no válido para actualización:", id);
      throw new Error("ID de calendario no válido");
    }
    
    if (simulateLocalStorage) {
      console.log(`[DEV] Actualizando calendario ${id} en localStorage`);
      
      // Si data no es un array o está vacío, inicializar con estructura básica
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("Data no válida para actualizar calendario, inicializando con estructura básica");
        data = Array(7).fill().map(() => ({
          manana: [],
          tarde: []
        }));
      }
      
      // Guardar directamente en localStorage para simplificar
      saveLocalCollection('calendario', data);
      return true;
    }

    // Código original para Firebase
    await setDoc(doc(calendarioCollection, id), {
      ...data,
      updatedAt: serverTimestamp()
    })
    return true;
  } catch (error) {
    console.error("Error al actualizar calendario:", error)
    throw error;
  }
};

// Implementación completa de las funciones de pacientes
const getPacientesByEstado = async (estado) => {
  try {
    if (simulateLocalStorage) {
      console.log(`[DEV] Obteniendo pacientes con estado: ${estado} desde localStorage`);
      const pacientes = getLocalCollection('pacientes');
      const pacientesFiltrados = pacientes.filter(p => p.estado === estado);
      console.log(`[DEV] Encontrados ${pacientesFiltrados.length} pacientes con estado: ${estado}`);
      return pacientesFiltrados;
    }

    // Código original para Firebase
    const q = query(pacientesCollection, where("estado", "==", estado))
    const querySnapshot = await getDocs(q)
    const pacientes = []
    
    querySnapshot.forEach((doc) => {
      pacientes.push({
        id: doc.id,
        ...doc.data(),
        // Convertir timestamps a fechas legibles
        fechaIngreso: doc.data().fechaIngreso ? doc.data().fechaIngreso.toDate() : null
      })
    })
    
    return pacientes
  } catch (error) {
    console.error(`Error al obtener pacientes con estado ${estado}:`, error)
    throw error
  }
};

const addPaciente = async (pacienteData) => {
  try {
    // Verificar que el paciente tiene todos los datos necesarios
    if (!pacienteData.nombre || !pacienteData.tipoFractura) {
      console.error("Error: Datos de paciente incompletos:", pacienteData);
      throw new Error("Datos de paciente incompletos");
    }

    if (simulateLocalStorage) {
      console.log('[DEV] Añadiendo paciente a localStorage:', pacienteData);
      const pacientes = getLocalCollection('pacientes');
      
      // Asegurar que el paciente tiene un ID
      const pacienteConId = { 
        ...pacienteData,
        id: pacienteData.id || generateId(), // Usar el ID existente o generar uno nuevo
        fechaIngreso: pacienteData.fechaIngreso || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      pacientes.push(pacienteConId);
      saveLocalCollection('pacientes', pacientes);
      console.log('[DEV] Paciente guardado con ID:', pacienteConId.id);
      return pacienteConId.id;
    }

    // Código original para Firebase
    const docRef = doc(pacientesCollection)
    
    await setDoc(docRef, {
      ...pacienteData,
      fechaIngreso: Timestamp.fromDate(new Date()),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error("Error al añadir paciente:", error)
    throw error
  }
};

const updatePaciente = async (id, data) => {
  try {
    // Validar que el ID no esté vacío
    if (!id) {
      console.error("Error: ID de paciente no válido para actualización:", id);
      throw new Error("ID de paciente no válido");
    }

    if (simulateLocalStorage) {
      console.log(`[DEV] Actualizando paciente ${id} en localStorage:`, data);
      const pacientes = getLocalCollection('pacientes');
      const index = pacientes.findIndex(p => p.id === id);
      
      if (index >= 0) {
        pacientes[index] = {
          ...pacientes[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        saveLocalCollection('pacientes', pacientes);
        return true;
      } else {
        console.error(`No se encontró paciente con id ${id} para actualizar`);
        throw new Error(`Paciente no encontrado: ${id}`);
      }
    }

    // Código original para Firebase
    await updateDoc(doc(pacientesCollection, id), {
      ...data,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error("Error al actualizar paciente:", error)
    throw error
  }
};

const deletePaciente = async (id) => {
  try {
    // Validar que el ID no esté vacío
    if (!id) {
      console.error("Error: ID de paciente no válido para eliminar:", id);
      throw new Error("ID de paciente no válido");
    }
    
    if (simulateLocalStorage) {
      console.log(`[DEV] Eliminando paciente ${id} de localStorage`);
      const pacientes = getLocalCollection('pacientes');
      const newPacientes = pacientes.filter(p => p.id !== id);
      
      // Verificar que realmente se eliminó un paciente
      if (newPacientes.length === pacientes.length) {
        console.error(`No se encontró paciente con id ${id} para eliminar`);
        throw new Error(`Paciente no encontrado: ${id}`);
      }
      
      saveLocalCollection('pacientes', newPacientes);
      return true;
    }

    // Código original para Firebase
    await deleteDoc(doc(pacientesCollection, id))
    return true
  } catch (error) {
    console.error("Error al eliminar paciente:", error)
    throw error
  }
};

const resetSemana = async () => {
  try {
    if (simulateLocalStorage) {
      console.log('[DEV] Reseteando semana en localStorage');
      
      // Obtener pacientes programados
      const pacientes = getLocalCollection('pacientes');
      const programados = pacientes.filter(p => p.estado === 'programado');
      
      // Moverlos al histórico
      const historico = getLocalCollection('historico');
      const pacientesActualizados = pacientes.filter(p => p.estado !== 'programado');
      
      programados.forEach(p => {
        historico.push({
          ...p,
          fechaArchivado: new Date().toISOString(),
          semanaArchivado: new Date().toISOString().slice(0, 10)
        });
      });
      
      // Limpiar calendario
      saveLocalCollection('pacientes', pacientesActualizados);
      saveLocalCollection('historico', historico);
      saveLocalCollection('calendario', Array(7).fill().map(() => ({
        manana: [],
        tarde: []
      })));
      
      return true;
    }

    // Firebase implementation would go here
    return true;
  } catch (error) {
    console.error("Error al resetear semana:", error)
    throw error
  }
};

// Añadir función para inicializar localStorage con datos de ejemplo (opcional)
const initializeLocalStorage = () => {
  console.log('[DEV] Inicializando localStorage con datos iniciales');
  
  // Asegurarnos de que siempre hay una configuración disponible
  ensureConfigurationExists();
  
  // Asegurar que siempre hay un calendario inicializado
  const calendario = getLocalCollection('calendario');
  if (!calendario || !Array.isArray(calendario) || calendario.length === 0) {
    console.log('[DEV] Inicializando estructura de calendario básica');
    const calendarioVacio = Array(7).fill().map(() => ({
      manana: [],
      tarde: []
    }));
    saveLocalCollection('calendario', calendarioVacio);
  }
  
  // Verificar si ya hay datos de pacientes
  const pacientes = getLocalCollection('pacientes');
  if (pacientes.length > 0) {
    console.log('[DEV] Ya existen pacientes en localStorage, omitiendo inicialización de datos de ejemplo');
    return;
  }
  
  // Datos de ejemplo para desarrollo
  const ejemploPacientes = [
    {
      id: 'example-1',
      nombre: 'Juan Pérez',
      edad: 68,
      tipoFractura: 'Cadera - Pertrocantérea',
      detallesFractura: 'Lado derecho',
      estadoClinico: 'Estable, hipertensión controlada',
      fechaIngreso: new Date().toISOString(),
      estado: 'pendiente',
      medicacion: {}
    },
    {
      id: 'example-2',
      nombre: 'María Rodríguez',
      edad: 75,
      tipoFractura: 'Cadera - Subcapital',
      detallesFractura: 'Lado izquierdo',
      estadoClinico: 'Diabetes tipo 2',
      fechaIngreso: new Date(Date.now() - 86400000).toISOString(), // Ayer
      estado: 'urgente',
      medicacion: {}
    },
    {
      id: 'example-3',
      nombre: 'Carlos Gómez',
      edad: 62,
      tipoFractura: 'Cadera - Pertrocantérea',
      detallesFractura: 'Conminuta',
      estadoClinico: 'Estable',
      fechaIngreso: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
      estado: 'presentar',
      medicacion: {}
    }
  ];
  
  saveLocalCollection('pacientes', ejemploPacientes);
  console.log('[DEV] localStorage inicializado con datos de ejemplo');
};

// Llamar a esta función cuando se inicie la aplicación
initializeLocalStorage();

export {
  db,
  auth,
  loginWithEmail,
  logout,
  getUserData,
  getConfiguracion,
  updateConfiguracion,
  getPacientesByEstado,
  addPaciente,
  updatePaciente,
  deletePaciente,
  getCalendarioSemanal,
  updateCalendario,
  resetSemana,
  onAuthStateChanged
}