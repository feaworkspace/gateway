import { initializeApp } from 'firebase-admin/app';
import firebase from "firebase-admin";

export const firebaseAdminApp = initializeApp({
  credential: firebase.credential.applicationDefault()
});

/*
Ou alors :
export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
const app = initializeApp({
    credential: applicationDefault()
});
 */
