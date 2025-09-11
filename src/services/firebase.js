import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Objeto de configuração do Firebase, lendo as variáveis de ambiente do Vite
const firebaseConfig = {
  apiKey: "AIzaSyBTYPsfZaCV7eZJRf1eJbUN_cZcVz8w3tU",
  authDomain: "saas-juridico-cfb2e.firebaseapp.com",
  projectId: "saas-juridico-cfb2e",
  storageBucket: "saas-juridico-cfb2e.firebasestorage.app",
  messagingSenderId: "38037187265",
  appId: "1:38037187265:web:5b8b32d627185f64d98240"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase que serão usados na aplicação
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);