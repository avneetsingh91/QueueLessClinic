import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { assertFirebase, db } from './firebase'
import {
  DEFAULT_AVERAGE_CONSULTATION_MINUTES,
  MAX_TOKENS_PER_DAY,
  QUEUE_STATUS,
  TOKEN_STATUS,
} from '../utils/constants'
import { compareTokens, queueDateFor } from '../utils/queueHelpers'
import { consultationDurationMinutes, rollingAverage } from '../utils/timeEstimator'

const queueRefFor = (clinicId, queueDate) => doc(db, 'queues', `${clinicId}_${queueDate}`)
const publicRefFor = (slug) => doc(db, 'publicQueues', slug)
const tokensColRef = (queueId) => collection(db, 'queues', queueId, 'tokens')
const tokenRefFor = (queueId, tokenId) => doc(db, 'queues', queueId, 'tokens', tokenId)

const withId = (snapshot) => (snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)

const queueSnapshot = (queue) => ({
  currentTokenNumber: Number(queue.currentTokenNumber) || 0,
  currentServingTokenId: queue.currentServingTokenId || null,
  status: queue.status || QUEUE_STATUS.OPEN,
  announcement: queue.announcement || '',
  averageConsultationMinutes:
    Number(queue.averageConsultationMinutes) || DEFAULT_AVERAGE_CONSULTATION_MINUTES,
  recentDurations: Array.isArray(queue.recentDurations) ? [...queue.recentDurations] : [],
  tokenSummaries: Array.isArray(queue.tokenSummaries) ? [...queue.tokenSummaries] : [],
})

const tokenSnapshot = (token) => ({
  id: token.id || token.tokenId || null,
  tokenNumber: Number(token.tokenNumber) || 0,
  status: token.status || TOKEN_STATUS.WAITING,
  isRecalled: Boolean(token.isRecalled),
  recalledCount: Number(token.recalledCount) || 0,
  cancelledReason: token.cancelledReason || null,
  servingStartedAt: token.servingStartedAt || null,
  completedAt: token.completedAt || null,
  createdAt: token.createdAt || null,
  updatedAt: token.updatedAt || null,
})

const updateSummaryStatus = (summaries, tokenId, status) =>
  summaries.map((entry) => (entry.id === tokenId ? { ...entry, status } : entry))

const patchSummary = (summaries, tokenId, patch) =>
  summaries.map((entry) => (entry.id === tokenId ? { ...entry, ...patch } : entry))

const sortedSummaries = (summaries = []) => [...summaries].sort(compareTokens)

const nextWaiting = (queue) =>
  sortedSummaries(queue.tokenSummaries || []).find(
    (entry) => entry.status === TOKEN_STATUS.WAITING,
  ) || null

const buildPublicData = (queue) => ({
  clinicId: queue.clinicId,
  queueId: queue.id,
  slug: queue.clinicSlug,
  clinicName: queue.clinicName || 'Clinic',
  doctorName: queue.doctorName || '',
  department: queue.department || '',
  queueDate: queue.queueDate,
  status: queue.status || QUEUE_STATUS.OPEN,
  announcement: queue.announcement || '',
  currentTokenNumber: Number(queue.currentTokenNumber) || 0,
  currentServingTokenNumber:
    (queue.tokenSummaries || []).find(
      (entry) => entry.id === queue.currentServingTokenId,
    )?.tokenNumber || null,
  tokenSummaries: sortedSummaries(queue.tokenSummaries || []).map((entry) => ({
    tokenNumber: Number(entry.tokenNumber) || 0,
    status: entry.status,
  })),
  averageConsultationMinutes:
    Number(queue.averageConsultationMinutes) || DEFAULT_AVERAGE_CONSULTATION_MINUTES,
  updatedAt: serverTimestamp(),
})

async function performQueueAction({ queueId, action, actor, handler }) {
  assertFirebase()
  const queueRef = doc(db, 'queues', queueId)
  const eventRef = doc(collection(db, 'queueEvents'))

  return runTransaction(db, async (transaction) => {
    const queueSnapshotDoc = await transaction.get(queueRef)
    if (!queueSnapshotDoc.exists()) throw new Error('This queue no longer exists.')
    const queue = withId(queueSnapshotDoc)
    const outcome = await handler({ transaction, queue })

    const updates = { ...outcome.updates, updatedAt: serverTimestamp() }
    transaction.update(queueRef, updates)
    transaction.set(publicRefFor(queue.clinicSlug), buildPublicData({ ...queue, ...updates }), {
      merge: true,
    })

    ;(outcome.tokenWrites || []).forEach(({ ref, data, merge }) => {
      if (merge) transaction.set(ref, data, { merge: true })
      else transaction.set(ref, data)
    })

    transaction.set(eventRef, {
      clinicId: queue.clinicId,
      queueId,
      tokenId: outcome.tokenId || null,
      action,
      performedBy: actor?.uid || 'system',
      performedByName: actor?.name || 'System',
      timestamp: serverTimestamp(),
      metadata: outcome.metadata || {},
      undoData: outcome.undoData || null,
      reversible: Boolean(outcome.undoData),
      undone: false,
    })

    return outcome.value
  })
}

export async function ensureTodayQueue(clinic, queueDate = queueDateFor()) {
  assertFirebase()
  if (!clinic?.id) throw new Error('Clinic information is missing.')
  const queueRef = queueRefFor(clinic.id, queueDate)

  const existing = await getDoc(queueRef)
  if (existing.exists()) return withId(existing)

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(queueRef)
    if (snapshot.exists()) return withId(snapshot)

    const queueId = queueRef.id
    const payload = {
      clinicId: clinic.id,
      clinicName: clinic.name || 'Clinic',
      clinicSlug: clinic.publicSlug || clinic.slug,
      queueDate,
      doctorName: clinic.doctorName || '',
      department: clinic.department || '',
      currentTokenNumber: 0,
      currentServingTokenId: null,
      status: QUEUE_STATUS.OPEN,
      averageConsultationMinutes:
        Number(clinic.averageConsultationMinutes) || DEFAULT_AVERAGE_CONSULTATION_MINUTES,
      recentDurations: [],
      tokenSummaries: [],
      announcement: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    transaction.set(queueRef, payload)
    if (payload.clinicSlug) {
      transaction.set(publicRefFor(payload.clinicSlug), buildPublicData({ ...payload, id: queueId }), {
        merge: true,
      })
    }
    return { id: queueId, ...payload }
  })
}

export function watchQueue(queueId, callback, onError) {
  assertFirebase()
  return onSnapshot(doc(db, 'queues', queueId), (snapshot) => callback(withId(snapshot)), onError)
}

export function watchTokens(queueId, callback, onError) {
  assertFirebase()
  const tokensQuery = query(
    tokensColRef(queueId),
    orderBy('tokenNumber', 'asc'),
    limit(400),
  )
  return onSnapshot(
    tokensQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export function watchEvents(clinicId, callback, onError) {
  assertFirebase()
  const eventsQuery = query(
    collection(db, 'queueEvents'),
    where('clinicId', '==', clinicId),
    orderBy('timestamp', 'desc'),
    limit(60),
  )
  return onSnapshot(
    eventsQuery,
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  )
}

export function watchPublicQueue(slug, callback, onError) {
  assertFirebase()
  return onSnapshot(doc(db, 'publicQueues', slug), (snapshot) => callback(withId(snapshot)), onError)
}

export async function findPublicQueue(slug) {
  assertFirebase()
  return withId(await getDoc(doc(db, 'publicQueues', slug)))
}

export async function issueToken({ queueId, actor }) {
  return performQueueAction({
    queueId,
    action: 'TOKEN_CREATED',
    actor,
    handler: ({ transaction, queue }) => {
      if (queue.status === QUEUE_STATUS.CLOSED) {
        throw new Error('The queue is closed. Reopen it before issuing tokens.')
      }
      const nextNumber = (Number(queue.currentTokenNumber) || 0) + 1
      if (nextNumber > MAX_TOKENS_PER_DAY) {
        throw new Error(`The daily limit of ${MAX_TOKENS_PER_DAY} tokens has been reached.`)
      }
      const tokenRef = doc(collection(db, 'queues', queueId, 'tokens'))
      const summaries = [
        ...(queue.tokenSummaries || []),
        { id: tokenRef.id, tokenNumber: nextNumber, status: TOKEN_STATUS.WAITING, isRecalled: false },
      ]

      transaction.set(tokenRef, {
        clinicId: queue.clinicId,
        queueId,
        tokenNumber: nextNumber,
        status: TOKEN_STATUS.WAITING,
        isRecalled: false,
        recalledCount: 0,
        createdAt: serverTimestamp(),
        servingStartedAt: null,
        completedAt: null,
        updatedAt: serverTimestamp(),
      })

      return {
        updates: { currentTokenNumber: nextNumber, tokenSummaries: summaries },
        tokenId: tokenRef.id,
        metadata: { tokenNumber: nextNumber },
        undoData: {
          queue: queueSnapshot(queue),
          tokens: [],
          deleteTokenIds: [tokenRef.id],
        },
        value: { tokenId: tokenRef.id, tokenNumber: nextNumber },
      }
    },
  })
}

export async function nextToken({ queueId, actor }) {
  return performQueueAction({
    queueId,
    action: 'NEXT_TOKEN',
    actor,
    handler: async ({ transaction, queue }) => {
      if (queue.status === QUEUE_STATUS.CLOSED || queue.status === QUEUE_STATUS.PAUSED) {
        throw new Error('Reopen the queue before calling the next token.')
      }

      const tokenWrites = []
      const restoredTokens = []
      let summaries = [...(queue.tokenSummaries || [])]
      let durations = [...(queue.recentDurations || [])]
      const serving = summaries.find((entry) => entry.status === TOKEN_STATUS.SERVING)

      if (serving) {
        const servingDoc = await transaction.get(tokenRefFor(queueId, serving.id))
        if (servingDoc.exists()) {
          const token = withId(servingDoc)
          restoredTokens.push(tokenSnapshot(token))
          const duration = consultationDurationMinutes({
            servingStartedAt: token.servingStartedAt,
            completedAt: Date.now(),
          })
          if (duration !== null) durations.push(duration)
          tokenWrites.push({
            ref: tokenRefFor(queueId, serving.id),
            data: {
              status: TOKEN_STATUS.COMPLETED,
              completedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            merge: true,
          })
          summaries = updateSummaryStatus(summaries, serving.id, TOKEN_STATUS.COMPLETED)
        }
      }

      const candidate = nextWaiting({ ...queue, tokenSummaries: summaries })
      let newServingId = null
      if (candidate) {
        const candidateDoc = await transaction.get(tokenRefFor(queueId, candidate.id))
        if (candidateDoc.exists()) {
          restoredTokens.push(tokenSnapshot(withId(candidateDoc)))
          tokenWrites.push({
            ref: tokenRefFor(queueId, candidate.id),
            data: {
              status: TOKEN_STATUS.SERVING,
              servingStartedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            merge: true,
          })
          summaries = updateSummaryStatus(summaries, candidate.id, TOKEN_STATUS.SERVING)
          newServingId = candidate.id
        }
      }

      if (!serving && !candidate) {
        throw new Error('There are no waiting tokens to call.')
      }

      const average = rollingAverage(durations, queue.averageConsultationMinutes)
      return {
        updates: {
          currentServingTokenId: newServingId,
          tokenSummaries: summaries,
          recentDurations: durations.slice(-10),
          averageConsultationMinutes: average,
        },
        tokenWrites,
        tokenId: newServingId || serving?.id || null,
        metadata: { calledTokenNumber: candidate?.tokenNumber || null },
        undoData: { queue: queueSnapshot(queue), tokens: restoredTokens, deleteTokenIds: [] },
        value: {
          calledTokenNumber: candidate?.tokenNumber || null,
          completedTokenNumber: serving?.tokenNumber || null,
        },
      }
    },
  })
}

export async function skipToken({ queueId, tokenId, actor }) {
  return performQueueAction({
    queueId,
    action: 'SKIP_TOKEN',
    actor,
    handler: async ({ transaction, queue }) => {
      const entry = (queue.tokenSummaries || []).find((item) => item.id === tokenId)
      if (!entry) throw new Error('Token not found.')
      if (entry.status === TOKEN_STATUS.SKIPPED) throw new Error('This token is already skipped.')
      if (entry.status === TOKEN_STATUS.COMPLETED || entry.status === TOKEN_STATUS.CANCELLED) {
        throw new Error('This token can no longer be skipped.')
      }

      const tokenDoc = await transaction.get(tokenRefFor(queueId, tokenId))
      const restoredTokens = tokenDoc.exists() ? [tokenSnapshot(withId(tokenDoc))] : []
      const tokenWrites = [
        {
          ref: tokenRefFor(queueId, tokenId),
          data: { status: TOKEN_STATUS.SKIPPED, updatedAt: serverTimestamp() },
          merge: true,
        },
      ]
      let summaries = updateSummaryStatus(
        queue.tokenSummaries || [],
        tokenId,
        TOKEN_STATUS.SKIPPED,
      )
      let currentServingTokenId = queue.currentServingTokenId

      if (currentServingTokenId === tokenId) {
        currentServingTokenId = null
        const candidate = nextWaiting({ ...queue, tokenSummaries: summaries })
        if (candidate) {
          const candidateDoc = await transaction.get(tokenRefFor(queueId, candidate.id))
          if (candidateDoc.exists()) {
            restoredTokens.push(tokenSnapshot(withId(candidateDoc)))
            tokenWrites.push({
              ref: tokenRefFor(queueId, candidate.id),
              data: {
                status: TOKEN_STATUS.SERVING,
                servingStartedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              merge: true,
            })
            summaries = updateSummaryStatus(summaries, candidate.id, TOKEN_STATUS.SERVING)
            currentServingTokenId = candidate.id
          }
        }
      }

      return {
        updates: { tokenSummaries: summaries, currentServingTokenId },
        tokenWrites,
        tokenId,
        metadata: { tokenNumber: entry.tokenNumber },
        undoData: { queue: queueSnapshot(queue), tokens: restoredTokens, deleteTokenIds: [] },
        value: { tokenNumber: entry.tokenNumber },
      }
    },
  })
}

export async function completeToken({ queueId, tokenId, actor }) {
  return performQueueAction({
    queueId,
    action: 'COMPLETE_TOKEN',
    actor,
    handler: async ({ transaction, queue }) => {
      const entry = (queue.tokenSummaries || []).find((item) => item.id === tokenId)
      if (!entry) throw new Error('Token not found.')
      if (entry.status !== TOKEN_STATUS.SERVING) {
        throw new Error('Only the token currently in consultation can be completed.')
      }
      const tokenDoc = await transaction.get(tokenRefFor(queueId, tokenId))
      const token = withId(tokenDoc)
      const duration = token ? consultationDurationMinutes({
        servingStartedAt: token.servingStartedAt,
        completedAt: Date.now(),
      }) : null
      const durations = [...(queue.recentDurations || []), ...(duration !== null ? [duration] : [])]
      const average = rollingAverage(durations, queue.averageConsultationMinutes)

      return {
        updates: {
          tokenSummaries: updateSummaryStatus(
            queue.tokenSummaries || [],
            tokenId,
            TOKEN_STATUS.COMPLETED,
          ),
          currentServingTokenId: null,
          recentDurations: durations.slice(-10),
          averageConsultationMinutes: average,
        },
        tokenWrites: [
          {
            ref: tokenRefFor(queueId, tokenId),
            data: {
              status: TOKEN_STATUS.COMPLETED,
              completedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            merge: true,
          },
        ],
        tokenId,
        metadata: { tokenNumber: entry.tokenNumber },
        undoData: {
          queue: queueSnapshot(queue),
          tokens: token ? [tokenSnapshot(token)] : [],
          deleteTokenIds: [],
        },
        value: { tokenNumber: entry.tokenNumber },
      }
    },
  })
}

export async function recallToken({ queueId, tokenId, actor }) {
  return performQueueAction({
    queueId,
    action: 'RECALL_TOKEN',
    actor,
    handler: async ({ transaction, queue }) => {
      const entry = (queue.tokenSummaries || []).find((item) => item.id === tokenId)
      if (!entry) throw new Error('Token not found.')
      if (entry.status === TOKEN_STATUS.COMPLETED) {
        throw new Error('A completed token cannot be recalled.')
      }
      const tokenDoc = await transaction.get(tokenRefFor(queueId, tokenId))
      const token = withId(tokenDoc)
      const canActivate = !queue.currentServingTokenId && queue.status === QUEUE_STATUS.OPEN
      const newStatus = canActivate ? TOKEN_STATUS.SERVING : TOKEN_STATUS.WAITING
      const tokenWrites = [
        {
          ref: tokenRefFor(queueId, tokenId),
          data: {
            status: newStatus,
            isRecalled: true,
            recalledCount: (Number(token?.recalledCount) || 0) + 1,
            servingStartedAt: canActivate ? serverTimestamp() : token?.servingStartedAt || null,
            updatedAt: serverTimestamp(),
          },
          merge: true,
        },
      ]

      return {
        updates: {
          tokenSummaries: patchSummary(queue.tokenSummaries || [], tokenId, {
            status: newStatus,
            isRecalled: true,
          }),
          currentServingTokenId: canActivate ? tokenId : queue.currentServingTokenId || null,
        },
        tokenWrites,
        tokenId,
        metadata: { tokenNumber: entry.tokenNumber },
        undoData: {
          queue: queueSnapshot(queue),
          tokens: token ? [tokenSnapshot(token)] : [],
          deleteTokenIds: [],
        },
        value: { tokenNumber: entry.tokenNumber },
      }
    },
  })
}

export async function markTokenAbsent({ queueId, tokenId, actor }) {
  return performQueueAction({
    queueId,
    action: 'MARK_ABSENT',
    actor,
    handler: async ({ transaction, queue }) => {
      const entry = (queue.tokenSummaries || []).find((item) => item.id === tokenId)
      if (!entry) throw new Error('Token not found.')
      if (entry.status === TOKEN_STATUS.COMPLETED || entry.status === TOKEN_STATUS.CANCELLED) {
        throw new Error('This token is already closed.')
      }
      const tokenDoc = await transaction.get(tokenRefFor(queueId, tokenId))
      const token = withId(tokenDoc)
      const restoredTokens = token ? [tokenSnapshot(token)] : []
      const tokenWrites = [
        {
          ref: tokenRefFor(queueId, tokenId),
          data: {
            status: TOKEN_STATUS.CANCELLED,
            cancelledReason: 'absent',
            updatedAt: serverTimestamp(),
          },
          merge: true,
        },
      ]
      let summaries = updateSummaryStatus(
        queue.tokenSummaries || [],
        tokenId,
        TOKEN_STATUS.CANCELLED,
      )
      let currentServingTokenId = queue.currentServingTokenId
      if (currentServingTokenId === tokenId) {
        currentServingTokenId = null
        const candidate = nextWaiting({ ...queue, tokenSummaries: summaries })
        if (candidate) {
          const candidateDoc = await transaction.get(tokenRefFor(queueId, candidate.id))
          if (candidateDoc.exists()) {
            restoredTokens.push(tokenSnapshot(withId(candidateDoc)))
            tokenWrites.push({
              ref: tokenRefFor(queueId, candidate.id),
              data: {
                status: TOKEN_STATUS.SERVING,
                servingStartedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              merge: true,
            })
            summaries = updateSummaryStatus(summaries, candidate.id, TOKEN_STATUS.SERVING)
            currentServingTokenId = candidate.id
          }
        }
      }

      return {
        updates: { tokenSummaries: summaries, currentServingTokenId },
        tokenWrites,
        tokenId,
        metadata: { tokenNumber: entry.tokenNumber },
        undoData: { queue: queueSnapshot(queue), tokens: restoredTokens, deleteTokenIds: [] },
        value: { tokenNumber: entry.tokenNumber },
      }
    },
  })
}

export async function resetDailyQueue({ queueId, actor }) {
  assertFirebase()
  const tokensSnapshot = await getDocs(tokensColRef(queueId))
  const tokens = tokensSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }))

  if (tokens.length > 400) {
    const batch = writeBatch(db)
    tokens.forEach((token) => {
      batch.update(tokenRefFor(queueId, token.id), {
        status: TOKEN_STATUS.CANCELLED,
        cancelledReason: 'daily-reset',
        updatedAt: serverTimestamp(),
      })
    })
    await batch.commit()
  }

  return performQueueAction({
    queueId,
    action: 'RESET_QUEUE',
    actor,
    handler: ({ transaction, queue }) => {
      if (tokens.length <= 400) {
        tokens.forEach((token) => {
          transaction.update(tokenRefFor(queueId, token.id), {
            status: TOKEN_STATUS.CANCELLED,
            cancelledReason: 'daily-reset',
            updatedAt: serverTimestamp(),
          })
        })
      }
      return {
        updates: {
          currentTokenNumber: 0,
          currentServingTokenId: null,
          tokenSummaries: [],
          status: QUEUE_STATUS.OPEN,
          announcement: '',
          recentDurations: [],
          averageConsultationMinutes: DEFAULT_AVERAGE_CONSULTATION_MINUTES,
        },
        metadata: { tokensReset: tokens.length },
        undoData: {
          queue: queueSnapshot(queue),
          tokens: tokens.map(tokenSnapshot),
          deleteTokenIds: [],
        },
        value: { tokensReset: tokens.length },
      }
    },
  })
}

export async function setQueueStatus({ queueId, status, actor }) {
  return performQueueAction({
    queueId,
    action: 'STATUS_CHANGED',
    actor,
    handler: ({ queue }) => ({
      updates: { status },
      metadata: { from: queue.status, to: status },
      value: { status },
    }),
  })
}

export async function setAnnouncement({ queueId, announcement, actor }) {
  return performQueueAction({
    queueId,
    action: 'ANNOUNCEMENT_SET',
    actor,
    handler: () => ({
      updates: { announcement: String(announcement || '').slice(0, 240) },
      metadata: {},
      value: { announcement },
    }),
  })
}

export async function setQueueDoctor({ queueId, doctorName, department, actor }) {
  return performQueueAction({
    queueId,
    action: 'STATUS_CHANGED',
    actor,
    handler: () => ({
      updates: { doctorName: String(doctorName || ''), department: String(department || '') },
      metadata: {},
      value: { doctorName, department },
    }),
  })
}

export async function updateAverageConsultationMinutes({ queueId, minutes, actor }) {
  return performQueueAction({
    queueId,
    action: 'STATUS_CHANGED',
    actor,
    handler: () => ({
      updates: { averageConsultationMinutes: Math.max(1, Math.min(60, Number(minutes) || 8)) },
      metadata: {},
      value: { minutes },
    }),
  })
}

export async function undoLastAction({ eventId, actor }) {
  assertFirebase()
  const eventRef = doc(db, 'queueEvents', eventId)
  const undoEventRef = doc(collection(db, 'queueEvents'))
  const event = withId(await getDoc(eventRef))
  if (!event) throw new Error('Audit entry not found.')
  if (event.undone) throw new Error('This action has already been undone.')
  if (!event.reversible || !event.undoData) throw new Error('This action cannot be undone.')

  return runTransaction(db, async (transaction) => {
    const restoredEvent = withId(await transaction.get(eventRef))
    if (!restoredEvent || restoredEvent.undone) throw new Error('This action has already been undone.')

    const queueRef = doc(db, 'queues', event.queueId)
    const queue = withId(await transaction.get(queueRef))
    if (!queue) throw new Error('The queue no longer exists.')

    const previous = event.undoData.queue || {}
    const fields = [
      'currentTokenNumber',
      'currentServingTokenId',
      'status',
      'announcement',
      'averageConsultationMinutes',
      'recentDurations',
      'tokenSummaries',
    ]
    const updates = {}
    fields.forEach((field) => {
      if (field in previous) updates[field] = previous[field]
    })
    updates.updatedAt = serverTimestamp()
    transaction.update(queueRef, updates)
    transaction.set(publicRefFor(queue.clinicSlug), buildPublicData({ ...queue, ...updates }), {
      merge: true,
    })

    ;(event.undoData.tokens || []).forEach((token) => {
      if (!token.id) return
      const tokenFields = { ...token }
      delete tokenFields.id
      transaction.set(tokenRefFor(event.queueId, token.id), tokenFields, { merge: true })
    })
    ;(event.undoData.deleteTokenIds || []).forEach((tokenId) => {
      transaction.delete(tokenRefFor(event.queueId, tokenId))
    })

    transaction.update(eventRef, { undone: true, undoneAt: serverTimestamp(), undoneBy: actor?.uid })
    transaction.set(undoEventRef, {
      clinicId: event.clinicId,
      queueId: event.queueId,
      tokenId: event.tokenId || null,
      action: 'UNDO_ACTION',
      performedBy: actor?.uid || 'system',
      performedByName: actor?.name || 'System',
      timestamp: serverTimestamp(),
      metadata: { originalAction: event.action },
      reversible: false,
      undone: false,
    })
    return { undoneAction: event.action }
  })
}

export async function fetchQueueTokens(queueId) {
  assertFirebase()
  const snapshot = await getDocs(tokensColRef(queueId))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}
