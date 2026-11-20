import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { collection, doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore'
import { assertFirebase, auth, db } from './firebase'
import { queueDateFor } from '../utils/queueHelpers'
import {
  DEFAULT_AVERAGE_CONSULTATION_MINUTES,
  QUEUE_STATUS,
  ROLES,
} from '../utils/constants'

const randomSuffix = () => Math.random().toString(36).slice(2, 6)

export const generateSlug = (name) => {
  const base = String(name || 'clinic')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36) || 'clinic'
  return `${base}-${randomSuffix()}`
}

export async function registerClinic({
  clinicName,
  slug,
  address,
  contactNumber,
  doctorName,
  department,
  name,
  email,
  password,
}) {
  assertFirebase()
  let credential = null

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidateSlug = attempt === 0 ? slug : generateSlug(clinicName)
    try {
      credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(credential.user, { displayName: name.trim() })

      const uid = credential.user.uid
      const clinicRef = doc(collection(db, 'clinics'))
      const userRef = doc(db, 'users', uid)
      const publicRef = doc(db, 'publicQueues', candidateSlug)
      const queueDate = queueDateFor()
      const queueId = `${clinicRef.id}_${queueDate}`
      const queueRef = doc(db, 'queues', queueId)
      const eventRef = doc(collection(db, 'queueEvents'))

      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(publicRef)
        if (existing.exists()) {
          throw new Error('That public queue link is already taken. Please try again.')
        }

        const now = serverTimestamp()

        transaction.set(clinicRef, {
          name: clinicName.trim(),
          publicSlug: candidateSlug,
          slug: candidateSlug,
          address: (address || '').trim(),
          contactNumber: (contactNumber || '').trim(),
          email: email.trim(),
          ownerId: uid,
          createdAt: now,
          updatedAt: now,
          isActive: true,
          averageConsultationMinutes: DEFAULT_AVERAGE_CONSULTATION_MINUTES,
          currentQueueId: queueId,
          doctorName: (doctorName || '').trim(),
          department: (department || '').trim(),
        })

        transaction.set(userRef, {
          name: name.trim(),
          email: email.trim(),
          role: ROLES.ADMIN,
          clinicId: clinicRef.id,
          createdAt: now,
          updatedAt: now,
          isActive: true,
        })

        transaction.set(queueRef, {
          clinicId: clinicRef.id,
          clinicName: clinicName.trim(),
          clinicSlug: candidateSlug,
          queueDate,
          doctorName: (doctorName || '').trim(),
          department: (department || '').trim(),
          currentTokenNumber: 0,
          currentServingTokenId: null,
          status: QUEUE_STATUS.OPEN,
          averageConsultationMinutes: DEFAULT_AVERAGE_CONSULTATION_MINUTES,
          recentDurations: [],
          tokenSummaries: [],
          announcement: '',
          createdAt: now,
          updatedAt: now,
        })

        transaction.set(publicRef, {
          clinicId: clinicRef.id,
          queueId,
          slug: candidateSlug,
          clinicName: clinicName.trim(),
          doctorName: (doctorName || '').trim(),
          department: (department || '').trim(),
          queueDate,
          status: QUEUE_STATUS.OPEN,
          announcement: '',
          currentTokenNumber: 0,
          currentServingTokenNumber: null,
          tokenSummaries: [],
          averageConsultationMinutes: DEFAULT_AVERAGE_CONSULTATION_MINUTES,
          updatedAt: now,
        })

        transaction.set(eventRef, {
          clinicId: clinicRef.id,
          queueId,
          tokenId: null,
          action: 'QUEUE_CREATED',
          performedBy: uid,
          performedByName: name.trim(),
          timestamp: now,
          metadata: { queueDate },
          reversible: false,
          undone: false,
        })
      })

      return { clinicId: clinicRef.id, queueId, slug: candidateSlug }
    } catch (error) {
      if (credential) {
        try {
          await deleteUser(credential.user)
        } catch {
          // Account cleanup requires a fresh sign-in in rare cases; surface the original error.
        }
        credential = null
      }
      if (attempt === 4) throw error
    }
  }

  throw new Error('Unable to create your clinic. Please try again.')
}

export async function login(email, password) {
  assertFirebase()
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function logout() {
  assertFirebase()
  return signOut(auth)
}

export async function resetPassword(email) {
  assertFirebase()
  return sendPasswordResetEmail(auth, email.trim())
}

export async function updateStaffName(uid, name) {
  assertFirebase()
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name.trim() })
  }
  await updateDoc(doc(db, 'users', uid), { name: name.trim(), updatedAt: serverTimestamp() })
}
