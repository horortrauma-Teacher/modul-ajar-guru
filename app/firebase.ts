import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4fNOxyp-tznRdnpJtPVTmGJ6aGpwyBfQ",
  authDomain: "modulgen-b0306.firebaseapp.com",
  projectId: "modulgen-b0306",
  storageBucket: "modulgen-b0306.firebasestorage.app",
  messagingSenderId: "900699326868",
  appId: "1:900699326868:web:7f071efc91bab875e2e781",
  measurementId: "G-X47TFB73C6"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor modul Auth agar bisa dipanggil oleh halaman login
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();