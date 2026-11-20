import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim().length > 0,
)

let firebaseApp = null
let firebaseAuth = null
let firestore = null

if (isFirebaseConfigured) {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  firebaseAuth = getAuth(firebaseApp)
  firestore = getFirestore(firebaseApp)
}

export const app = firebaseApp
export const auth = firebaseAuth
export const db = firestore
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null

export const CONFIGURATION_MESSAGE =
  'Firebase is not configured yet. Add your web app values to .env (see .env.example) and restart the dev server.'

export function assertFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error(CONFIGURATION_MESSAGE)
  }
}

const AUTH_MESSAGES = {
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact your clinic administrator.',
  'auth/user-not-found': 'No account exists for that email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account already exists for that email address.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
}

export function friendlyAuthError(error) {
  if (!error) return 'Something went wrong. Please try again.'
  return AUTH_MESSAGES[error.code] || error.message || 'Something went wrong. Please try again.'
}

export function friendlyFirestoreError(error) {
  if (!error) return 'Something went wrong. Please try again.'
  if (error.code === 'permission-denied') {
    return 'You do not have permission to perform this action.'
  }
  if (error.code === 'unavailable') {
    return 'The service is temporarily unavailable. Please try again.'
  }
  return error.message || 'Something went wrong. Please try again.'
}

export const publicQueueBaseUrl = () => {
  const configured = import.meta.env.VITE_PUBLIC_QUEUE_BASE_URL
  const base = configured && configured.trim() ? configured.trim() : window.location.origin
  return base.replace(/\/+$/, '')
}

export const publicQueueUrl = (slug) => `${publicQueueBaseUrl()}/queue/${slug}`
