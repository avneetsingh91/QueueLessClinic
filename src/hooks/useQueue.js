import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from './useAuth'
import { watchClinic } from '../services/clinicService'
import {
  completeToken,
  ensureTodayQueue,
  issueToken,
  markTokenAbsent,
  nextToken,
  recallToken,
  resetDailyQueue,
  setAnnouncement,
  setQueueDoctor,
  setQueueStatus,
  skipToken,
  undoLastAction,
  updateAverageConsultationMinutes,
  watchEvents,
  watchQueue,
  watchTokens,
} from '../services/queueService'
import { friendlyFirestoreError, isFirebaseConfigured } from '../services/firebase'

export function useQueue() {
  const { user, profile, clinicId } = useAuth()
  const [clinic, setClinic] = useState(null)
  const [queue, setQueue] = useState(null)
  const [tokens, setTokens] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const eventsErrorRef = useRef(false)

  const actor = useMemo(
    () => ({ uid: user?.uid, name: profile?.name || user?.displayName || 'Staff' }),
    [user?.uid, user?.displayName, profile?.name],
  )

  useEffect(() => {
    if (!clinicId) {
      setLoading(false)
      return undefined
    }
    return watchClinic(
      clinicId,
      (nextClinic) => {
        setClinic(nextClinic)
        if (!nextClinic) setError('Your clinic record could not be found.')
      },
      (watchError) => setError(friendlyFirestoreError(watchError)),
    )
  }, [clinicId])

  useEffect(() => {
    if (!clinic || !clinicId) return undefined
    let cancelled = false
    ensureTodayQueue(clinic)
      .then((nextQueue) => {
        if (!cancelled) {
          setQueue(nextQueue)
          setError(null)
        }
      })
      .catch((queueError) => {
        if (!cancelled) setError(friendlyFirestoreError(queueError))
      })
    return () => {
      cancelled = true
    }
  }, [clinic, clinicId])

  useEffect(() => {
    if (!queue?.id) return undefined
    const unsubscribers = [
      watchQueue(
        queue.id,
        (nextQueue) => {
          setQueue(nextQueue)
          setLoading(false)
        },
        (watchError) => {
          setError(friendlyFirestoreError(watchError))
          setLoading(false)
        },
      ),
      watchTokens(
        queue.id,
        setTokens,
        (watchError) => setError(friendlyFirestoreError(watchError)),
      ),
      watchEvents(
        clinicId,
        (nextEvents) => {
          setEvents(nextEvents)
          eventsErrorRef.current = false
        },
        () => {
          setEvents([])
          if (!eventsErrorRef.current) {
            eventsErrorRef.current = true
            toast.error('Activity feed is preparing its Firestore index. It will appear shortly.')
          }
        },
      ),
    ]
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe())
  }, [queue?.id, clinicId])

  const run = useCallback(
    async (operation, successMessage) => {
      if (!queue?.id) {
        toast.error('The queue is not ready yet.')
        return null
      }
      setBusy(true)
      try {
        const result = await operation()
        if (successMessage) toast.success(successMessage)
        return result
      } catch (operationError) {
        toast.error(friendlyFirestoreError(operationError))
        return null
      } finally {
        setBusy(false)
      }
    },
    [queue?.id],
  )

  const actions = useMemo(
    () => ({
      issueToken: () => run(() => issueToken({ queueId: queue.id, actor }), 'New token issued.'),
      issueTokens: (count) =>
        run(async () => {
          for (let index = 0; index < Number(count); index += 1) {
            await issueToken({ queueId: queue.id, actor })
          }
        }, `${count} token${count === 1 ? '' : 's'} issued.`),
      nextToken: () => run(() => nextToken({ queueId: queue.id, actor }), 'Next token called.'),
      skipToken: (tokenId) =>
        run(() => skipToken({ queueId: queue.id, tokenId, actor }), 'Token skipped.'),
      completeToken: (tokenId) =>
        run(() => completeToken({ queueId: queue.id, tokenId, actor }), 'Consultation completed.'),
      recallToken: (tokenId) =>
        run(() => recallToken({ queueId: queue.id, tokenId, actor }), 'Token recalled.'),
      markAbsent: (tokenId) =>
        run(() => markTokenAbsent({ queueId: queue.id, tokenId, actor }), 'Patient marked absent.'),
      resetQueue: () =>
        run(() => resetDailyQueue({ queueId: queue.id, actor }), 'Daily queue reset.'),
      setStatus: (status) =>
        run(() => setQueueStatus({ queueId: queue.id, status, actor }), 'Queue status updated.'),
      setAnnouncement: (announcement) =>
        run(
          () => setAnnouncement({ queueId: queue.id, announcement, actor }),
          announcement ? 'Announcement published.' : 'Announcement cleared.',
        ),
      setDoctor: (doctorName, department) =>
        run(
          () => setQueueDoctor({ queueId: queue.id, doctorName, department, actor }),
          'Doctor details updated.',
        ),
      setAverage: (minutes) =>
        run(
          () => updateAverageConsultationMinutes({ queueId: queue.id, minutes, actor }),
          'Waiting-time settings updated.',
        ),
      undo: () =>
        run(
          async () => {
            const latest = events.find((event) => event.reversible && !event.undone)
            if (!latest) throw new Error('There is no recent action to undo.')
            return undoLastAction({ eventId: latest.id, actor })
          },
          'Last action undone.',
        ),
    }),
    [queue?.id, actor, events, run],
  )

  const lastAction = useMemo(
    () => events.find((event) => event.reversible && !event.undone) || null,
    [events],
  )

  return {
    clinic,
    queue,
    tokens,
    events,
    loading,
    busy,
    error,
    actions,
    lastAction,
    actor,
  }
}
