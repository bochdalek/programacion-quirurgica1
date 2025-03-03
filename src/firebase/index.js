// src/firebase/index.js
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

// Funciones de simulación para almacenamiento local (solo para desarrollo)
const simulateLocalStorage = (process.env.NODE_ENV !== 'production');

// Funciones de ayuda para localStorage
const getLocalCollection = (collectionName) => {
  try {
    return JSON.parse(localStorage.getItem(`dev_${collectionName}`) || '[]');
  } catch (error) {
    console.error(`Error al leer colección ${collectionName} de localStorage:`, error);
    return [];
  }
};

const saveLocalCollection = (collectionName, data) => {
  try {
    localStorage.setItem(`dev_${collectionName}`, JSON.stringify(data));
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

// Métodos para la configuración
const getConfiguracion = async () => {
  try {
    if (simulateLocalStorage) {
      console.log('[DEV] Obteniendo configuración desde localStorage');
      const configData = getLocalCollection('configuracion');
      // Si no hay configuración, devolver configuración por defecto
      if (configData.length === 0) {
        const defaultConfig = [
          { manana: 2, tarde: 2 },
          { manana: 2, tarde: 2 },
          { manana: 2, tarde: 2 },
          { manana: 2, tarde: 2 },
          { manana: 2, tarde: 2 },
          { manana: 1, tarde: 1 },
          { manana: 1, tarde: 1 }
        ];
        // Guardar configuración por defecto
        saveLocalCollection('configuracion', defaultConfig);
        return defaultConfig;
      }
      return configData;
    }

    const configSnapshot = await getDocs(configuracionCollection)
    const config = {}
    
    configSnapshot.forEach((doc) => {
      config[doc.id] = doc.data()
    })
    
    return config
  } catch (error) {
    console.error("Error al obtener configuración:", error)
    throw error
  }
}

const updateConfiguracion = async (id, data) => {
  try {
    if (simulateLocalStorage) {
      console.log(`[DEV] Actualizando configuración en localStorage`);
      // Simplemente guardar la configuración directamente
      saveLocalCollection('configuracion', data);
      return true;
    }

    await setDoc(doc(configuracionCollection, id), { 
      ...data, 
      updatedAt: serverTimestamp() 
    })
    return true
  } catch (error) {
    console.error("Error al actualizar configuración:", error)
    throw error
  }
}

// Métodos para pacientes
const getPacientesByEstado = async (estado) => {
  try {
    if (simulateLocalStorage) {
      console.log(`[DEV] Obteniendo pacientes con estado: ${estado} desde localStorage`);
      const pacientes = getLocalCollection('pacientes');
      return pacientes.filter(p => p.estado === estado);
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
}

const addPaciente = async (pacienteData) => {
  try {
    if (simulateLocalStorage) {
      console.log('[DEV] Añadiendo paciente a localStorage:', pacienteData);
      const pacientes = getLocalCollection('pacientes');
      const id = generateId();
      const timestamp = new Date().toISOString();
      
      const newPaciente = {
        ...pacienteData,
        id,
        fechaIngreso: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      pacientes.push(newPaciente);
      saveLocalCollection('pacientes', pacientes);
      return id;
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
}

const updatePaciente = async (id, data) => {
  try {
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
}

const deletePaciente = async (id) => {
  try {
    if (simulateLocalStorage) {
      console.log(`[DEV] Eliminando paciente ${id} de localStorage`);
      const pacientes = getLocalCollection('pacientes');
      const newPacientes = pacientes.filter(p => p.id !== id);
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
}

// Métodos para el calendario
const getCalendarioSemanal = async () => {
  try {
    if (simulateLocalStorage) {
      console.log('[DEV] Obteniendo calendario desde localStorage');
      return getLocalCollection('calendario');
    }

    // Código original para Firebase
    const calendarSnapshot = await getDocs(calendarioCollection)
    const calendario = []
    
    calendarSnapshot.forEach((doc) => {
      calendario.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return calendario
  } catch (error) {
    console.error("Error al obtener calendario:", error)
    throw error
  }
}

const updateCalendario = async (id, data) => {
  try {
    if (simulateLocalStorage) {
      console.log(`[DEV] Actualizando calendario ${id} en localStorage`);
      const calendario = getLocalCollection('calendario');
      const index = calendario.findIndex(c => c.id === id);
      
      if (index >= 0) {
        calendario[index] = {
          ...calendario[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
      } else {
        calendario.push({
          id,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      saveLocalCollection('calendario', calendario);
      return true;
    }

    // Código original para Firebase
    await setDoc(doc(calendarioCollection, id), {
      ...data,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error("Error al actualizar calendario:", error)
    throw error
  }
}

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
      saveLocalCollection('calendario', []);
      
      return true;
    }

    // Código original para Firebase
    const programadosQuery = query(pacientesCollection, where("estado", "==", "programado"))
    const programadosSnapshot = await getDocs(programadosQuery)
    
    // Colección para histórico
    const historicoCollection = collection(db, 'historico')
    
    // Operaciones en batch para mejor rendimiento
    const batch = db.batch()
    
    programadosSnapshot.forEach((pacienteDoc) => {
      // Crear documento en histórico
      const historicoRef = doc(historicoCollection)
      batch.set(historicoRef, {
        ...pacienteDoc.data(),
        fechaArchivado: serverTimestamp(),
        semanaArchivado: new Date().toISOString().slice(0, 10)
      })
      
      // Eliminar de pacientes
      batch.delete(pacienteDoc.ref)
    })
    
    // Limpiar el calendario
    const calendarSnapshot = await getDocs(calendarioCollection)
    calendarSnapshot.forEach((calendarDoc) => {
      batch.delete(calendarDoc.ref)
    })
    
    // Ejecutar todas las operaciones
    await batch.commit()
    
    return true
  } catch (error) {
    console.error("Error al resetear semana:", error)
    throw error
  }
}

// Añadir función para inicializar localStorage con datos de ejemplo (opcional)
const initializeLocalStorage = () => {
  if (!simulateLocalStorage) return;
  
  // Verificar si ya hay datos
  const pacientes = getLocalCollection('pacientes');
  if (pacientes.length > 0) return;
  
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
if (process.env.NODE_ENV !== 'production') {
  initializeLocalStorage();
}

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