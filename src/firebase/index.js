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
    // Mover pacientes programados a histórico
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