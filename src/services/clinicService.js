import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { assertFirebase, db } from './firebase'

const CLINIC_EDITABLE_FIELDS = [
  'name',
  'address',
  'contactNumber',
  'email',
  'averageConsultationMinutes',
  'doctorName',
  'department',
]

export function watchUserProfile(uid, callback, onError) {
  assertFirebase()
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  )
}

export async function getUserProfile(uid) {
  assertFirebase()
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

export function watchClinic(clinicId, callback, onError) {
  assertFirebase()
  return onSnapshot(
    doc(db, 'clinics', clinicId),
    (snapshot) => callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  )
}

export async function updateClinic(clinicId, updates) {
  assertFirebase()
  const clean = {}
  CLINIC_EDITABLE_FIELDS.forEach((field) => {
    if (field in updates && updates[field] !== undefined) clean[field] = updates[field]
  })
  clean.updatedAt = serverTimestamp()
  return updateDoc(doc(db, 'clinics', clinicId), clean)
}

export function watchDoctors(clinicId, callback, onError) {
  assertFirebase()
  const doctorsQuery = query(collection(db, 'doctors'), where('clinicId', '==', clinicId))
  return onSnapshot(
    doctorsQuery,
    (snapshot) => {
      const doctors = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      doctors.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
      callback(doctors)
    },
    onError,
  )
}

export async function addDoctor(clinicId, { name, department }) {
  assertFirebase()
  return addDoc(collection(db, 'doctors'), {
    clinicId,
    name: String(name || '').trim(),
    department: String(department || '').trim(),
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateDoctor(doctorId, updates) {
  assertFirebase()
  const clean = {}
  if ('name' in updates) clean.name = String(updates.name || '').trim()
  if ('department' in updates) clean.department = String(updates.department || '').trim()
  if ('isActive' in updates) clean.isActive = Boolean(updates.isActive)
  clean.updatedAt = serverTimestamp()
  return updateDoc(doc(db, 'doctors', doctorId), clean)
}

export function watchStaff(clinicId, callback, onError) {
  assertFirebase()
  const staffQuery = query(collection(db, 'users'), where('clinicId', '==', clinicId))
  return onSnapshot(
    staffQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export async function updateUserRole(uid, role) {
  assertFirebase()
  return updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() })
}
