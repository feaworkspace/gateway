// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, GithubAuthProvider, signInWithPopup as firebaseSignInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDllCgG960beHuFKACcO6XVEQzIZWmGYUg",
    authDomain: "workspace-82243.firebaseapp.com",
    projectId: "workspace-82243",
    storageBucket: "workspace-82243.firebasestorage.app",
    messagingSenderId: "479856605676",
    appId: "1:479856605676:web:1531c3d7ecab17eaa9e8c9",
    measurementId: "G-MCWPKL1VQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
const gitHubProvider = new GithubAuthProvider()
    .addScope("user:email");

async function signInWithPopup(provider) {
    const credential = await firebaseSignInWithPopup(auth, provider)
    await updateState(await credential.user.getIdToken());
}

auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in, get the ID token and update the state
        const idToken = await user.getIdToken();
        updateState(idToken);
    } else {
        // User is signed out
        onAuthStateChanged({ logged: false });
    }
});

async function updateState(idToken) {
    try {
        const user = await fetch("/api/auth", {
            credentials: "include",
            method: "POST",
            body: JSON.stringify({ token: idToken }),
            headers: {
                "content-type": "application/json"
            }
        }).then(rep => rep.json());
        onAuthStateChanged({ logged: true, user });
    } catch (e) {
        console.error(e);
        onAuthStateChanged({ logged: false });
    }
}

document.getElementById("github-button").addEventListener("click", () => signInWithPopup(gitHubProvider));

function onAuthStateChanged(state) {
    if(!state.logged) return;

    // get redirect search params
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    window.location.href = redirect || "/";
}