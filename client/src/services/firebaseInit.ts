import { initializeApp } from "firebase/app"

const firebaseConfig = {
    apiKey: "AIzaSyA5lAZW87_WUzrTENeo0cYvu7RbNpUpx6c",
    authDomain: "avfallskalender-228213.firebaseapp.com",
    databaseURL: "https://avfallskalender-228213.firebaseio.com",
    projectId: "avfallskalender-228213",
    storageBucket: "avfallskalender-228213.appspot.com",
    messagingSenderId: "532249461999",
    appId: "1:532249461999:web:522b3cb143a6542c94871a",
    measurementId: "G-X47S0H4PDD"
}

export const firebaseApp = initializeApp(firebaseConfig)
