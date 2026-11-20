import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import PublicQueueCard from '../components/queue/PublicQueueCard'
import { ErrorState } from '../components/common/States'
import { Skeleton } from '../components/common/Feedback'
import { usePublicQueue } from '../hooks/usePublicQueue'

const storageKey = (slug) => `queueless:token:${slug}`

function QueueSkeleton() {
  return (
    <div className="card mx-auto w-full max-w-xl overflow-hidden">
      <div className="bg-slate-200 p-7">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-10 h-3 w-32" />
        <Skeleton className="mt-3 h-7 w-52" />
        <Skeleton className="mt-3 h-4 w-36" />
      </div>
      <div className="space-y-4 p-7">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

export default function QueuePage() {
  const { slug } = useParams()
  const { queue, loading, error } = usePublicQueue(slug)
  const [myToken, setMyToken] = useState(null)
  const [tokenInput, setTokenInput] = useState('')
  const [tokenError, setTokenError] = useState('')

  useEffect(() => {
    if (!slug) return
    const stored = window.sessionStorage.getItem(storageKey(slug))
    if (stored) {
      setMyToken(Number(stored))
      setTokenInput(stored)
    }
  }, [slug])

  const submitToken = (number) => {
    const summaries = queue?.tokenSummaries || []
    if (!number || number < 1) {
      setTokenError('Enter a valid token number.')
      return
    }
    const exists = summaries.some((entry) => Number(entry.tokenNumber) === number)
    if (!exists) {
      setTokenError(`Token #${String(number).padStart(3, '0')} wasn't found in today's queue.`)
      return
    }
    setTokenError('')
    setMyToken(number)
    setTokenInput(String(number))
    window.sessionStorage.setItem(storageKey(slug), String(number))
    toast.success(`Now tracking token #${String(number).padStart(3, '0')}.`)
  }

  const changeToken = () => {
    setMyToken(null)
    setTokenInput('')
    setTokenError('')
    window.sessionStorage.removeItem(storageKey(slug))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/60 via-slate-50 to-slate-100">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <QrCode size={16} />
          </span>
          queueless<span className="text-brand-500">.</span>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft size={14} /> Home
        </Link>
      </header>

      <main className="mx-auto w-full max-w-xl px-4 pb-14 pt-2 sm:px-6">
        {loading ? (
          <QueueSkeleton />
        ) : error || !queue ? (
          <ErrorState
            title="Queue unavailable"
            message={error || 'This clinic queue could not be loaded. Check the link and try again.'}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <PublicQueueCard
            queue={queue}
            myToken={myToken}
            tokenInput={tokenInput}
            onTokenInput={setTokenInput}
            onSubmitToken={submitToken}
            onChangeToken={changeToken}
            tokenError={tokenError}
          />
        )}
        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          This page shows token information only. Patient names, phone numbers, and medical details
          are never displayed publicly.
        </p>
      </main>
    </div>
  )
}
