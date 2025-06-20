import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, update, off} from "firebase/database"; // ou getFirestore se usar Firestore

const firebaseConfig = {
  apiKey: "AIzaSyASVxhmee29D-U2mcOf3VHdOk9oz2E_KXU",
  authDomain: "cadastro-os.firebaseapp.com",
  databaseURL: "https://cadastro-os-default-rtdb.firebaseio.com",
  projectId: "cadastro-os",
  storageBucket: "cadastro-os.firebasestorage.app",
  messagingSenderId: "990995344011",
  appId: "1:990995344011:web:4246598f0c912cf814c28e"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);
export { auth, provider, db, app, off, update, createUserWithEmailAndPassword };
