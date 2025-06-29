import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBijtmlaXOLdIJW-VVjoOtGFTvn_03SU6w",
    authDomain: "smart-home-app-f8e21.firebaseapp.com",
    projectId: "smart-home-app-f8e21",
    storageBucket: "smart-home-app-f8e21.appspot.com",
    messagingSenderId: "33910429233",
    appId: "1:33910429233:web:4c97568b8e994a82a3a710",
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);