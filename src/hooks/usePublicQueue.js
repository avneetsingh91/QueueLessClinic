import { useEffect, useState } from 'react'
import { watchPublicQueue } from '../services/queueService'
import { CONFIGURATION_MESSAGE, friendlyFirestoreError, isFirebaseConfigured } from '../services/firebase'

export function usePublicQueue(slug) {
  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState(
    isFirebaseConfigured ? null : CONFIGURATION_MESSAGE,
  )

  useEffect(() => {
    if (!slug || !isFirebaseConfigured) {
      setLoading(false)
      return undefined
    }
    setLoading(true)
    return watchPublicQueue(
      slug,
      (nextQueue) => {
        setQueue(nextQueue)
        setError(nextQueue ? null : 'This clinic queue is not available.')
        setLoading(false)
      },
      (watchError) => {
        setError(friendlyFirestoreError(watchError))
        setLoading(false)
      },
    )
  }, [slug])

  return { queue, loading, error }
}
