import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/functions";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCQQghMN4w-_9fww7rdi7OZYHRrWtU4OBk",
  authDomain: "posmate-5fc0a.firebaseapp.com",
  projectId: "posmate-5fc0a",
  storageBucket: "posmate-5fc0a.appspot.com",
  messagingSenderId: "48463376409",
  appId: "1:48463376409:web:b427a4fbc3c210a5977a88",
};

firebase.initializeApp(firebaseConfig);
firebase
  .firestore()
  .enablePersistence()
  .catch(function (err) {
    if (err.code === "failed-precondition") {
      alert("Please only keep one tab of Divine POS open at a time.");
    }
    // err.code === "unimplemented" means the browser doesn't support persistence — silently ignore
  });

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// This account receives a fixed 3 extra devices for internal use.
// To change this, update the user's Firestore document instead.
export const OWNER_OVERRIDE_UID = "J6rAf2opwnSKAhefbOZW6HJdx1h2";

export const STRIPE_PUBLIC_KEY =
  "pk_live_51MHqrvCIw3L7DOwI0ol9CTCSH7mQXTLKpxTWKzmwOY1MdKwaYwhdJq6WTpkWdBeql3sS44JmybynlRnaO2nSa1FK001dHiEOZO";
