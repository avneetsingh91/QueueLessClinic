import { createContext, useContext } from 'react'
import { useQueue } from '../hooks/useQueue'

export const QueueContext = createContext(null)

export function QueueProvider({ children }) {
  const queueState = useQueue()
  return <QueueContext.Provider value={queueState}>{children}</QueueContext.Provider>
}

export function useQueueContext() {
  const context = useContext(QueueContext)
  if (!context) throw new Error('useQueueContext must be used inside <QueueProvider>.')
  return context
}
