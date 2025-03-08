import {getAuth, GithubAuthProvider, signInWithPopup as firebaseSignInWithPopup, AuthProvider} from "firebase/auth";
import {useFirebaseApp} from "~/hooks/useFirebaseApp";
import {createSignal} from "solid-js";
import AuthState from "~/backend/types/AuthState";

useFirebaseApp();

const auth = getAuth();
const gitHubProvider = new GithubAuthProvider()
  .addScope("user:email");

let resolveAuthStateReady: (state: AuthState) => void;
const authStateReady = new Promise((resolve) => resolveAuthStateReady = resolve);
const [authState, setAuthState] = createSignal<AuthState>({logged: false});
getAuth().authStateReady().then(async () => {
  await getAuth().currentUser?.getIdToken().then(updateState);
  resolveAuthStateReady(authState());
});

export default function useAuth() {
  return {
    authState,
    authStateReady,
    signInWithGitHub: () => signInWithPopup(gitHubProvider)
  };
}

async function signInWithPopup(provider: AuthProvider) {
  const credential = await firebaseSignInWithPopup(auth, provider)
  await updateState(await credential.user.getIdToken());
}

async function updateState(idToken: string) {
  try {
    const user = await fetch("/api/auth", {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({token: idToken}),
      headers: {
        "content-type": "application/json"
      }
    }).then(rep => rep.json());
    setAuthState({logged: true, user});
  } catch (e) {
    console.error(e);
    setAuthState({logged: false});
  }
}