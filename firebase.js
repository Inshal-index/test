import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIDnKRROcvay2S46IoKMte9gxJzJh3pyI",
  authDomain: "schedule-23a60.firebaseapp.com",
  databaseURL: "https://schedule-23a60-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "schedule-23a60",
  storageBucket: "schedule-23a60.firebasestorage.app",
  messagingSenderId: "929285681733",
  appId: "1:929285681733:web:9729e79045d53bfac9a92c",
  measurementId: "G-W7H24MGCGK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { doc, getDoc, onSnapshot, setDoc };
