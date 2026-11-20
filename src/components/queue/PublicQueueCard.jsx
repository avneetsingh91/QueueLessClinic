import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Info,
  PauseCircle,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Logo from '../layout/Logo'
import TokenEntry from './TokenEntry'
import { QueueStatusBadge } from '../common/Badge'
import { formatToken, isApproaching, statusLabel } from '../../utils/queueHelpers'
import { estimateWait } from '../../utils/timeEstimator'
import { QUEUE_STATUS, TOKEN_STATUS } from '../../utils/constants'

function Metric({ icon: Icon, label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-900',
    brand: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide opacity-70">
        <Icon size={13} /> {label}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
    </div>
  )
}

function StatusMessage({ entry, peopleAhead }) {
  if (!entry) return null
  if (entry.status === TOKEN_STATUS.SERVING) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
        <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold">It&apos;s your turn now.</p>
          <p className="mt-1 text-xs leading-5 text-emerald-800">
            Please proceed to the consultation room immediately.
          </p>
        </div>
      </div>
    )
  }
  if (entry.status === TOKEN_STATUS.COMPLETED) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
        <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold">Your consultation is complete.</p>
          <p className="mt-1 text-xs text-slate-500">Thank you for using Queueless.</p>
        </div>
      </div>
    )
  }
  if (entry.status === TOKEN_STATUS.SKIPPED) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertTriangle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold">Your token was skipped.</p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Please check with reception — you can be recalled when you are ready.
          </p>
        </div>
      </div>
    )
  }
  if (entry.status === TOKEN_STATUS.CANCELLED) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <Info className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold">This token is no longer active.</p>
          <p className="mt-1 text-xs text-rose-700">Please see reception for assistance.</p>
        </div>
      </div>
    )
  }
  if (isApproaching(peopleAhead)) {
    return (
      <div className="animate-fade-up flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-900 shadow-sm">
        <BellRing className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold">Your turn is approaching!</p>
          <p className="mt-1 text-xs leading-5 text-brand-800">
            Please return to the clinic reception.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
      <RefreshCw size={16} className="text-brand-500" />
      We&apos;ll update this page automatically as the queue moves.
    </div>
  )
}

export default function PublicQueueCard({ queue, myToken, tokenInput, onTokenInput, onSubmitToken, onChangeToken, tokenError }) {
  const summaries = queue.tokenSummaries || []
  const myEntry = myToken ? summaries.find((entry) => Number(entry.tokenNumber) === Number(myToken)) : null
  const servingEntry = summaries.find((entry) => entry.status === TOKEN_STATUS.SERVING)
  const peopleAhead = myEntry
    ? summaries.filter(
        (entry) => entry.status === TOKEN_STATUS.WAITING && Number(entry.tokenNumber) < Number(myToken),
      ).length
    : 0
  const estimate = estimateWait(peopleAhead, queue.averageConsultationMinutes)
  const isClosed = queue.status === QUEUE_STATUS.CLOSED

  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-br from-brand-600 via-brand-600 to-indigo-700 px-5 py-6 text-white sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <Logo light to={`/queue/${queue.slug || ''}`} />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wide">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> LIVE
            </span>
            <QueueStatusBadge status={queue.status} />
          </div>
        </div>
        <p className="mt-8 text-xs font-medium uppercase tracking-widest text-white/70">
          Live queue · {queue.department || 'Clinic'}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
          {queue.clinicName || 'Clinic'}
        </h1>
        {queue.doctorName && <p className="mt-1 text-sm text-white/80">{queue.doctorName}</p>}
      </div>

      <div className="space-y-5 px-5 py-6 sm:px-7">
        {queue.announcement && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <BellRing className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">Announcement</p>
              <p className="mt-1 text-sm leading-6">{queue.announcement}</p>
            </div>
          </div>
        )}

        {isClosed ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <PauseCircle className="mx-auto text-rose-500" size={28} />
            <h2 className="mt-3 text-lg font-bold text-rose-900">The queue is closed</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-rose-800">
              The clinic is not accepting or calling tokens right now. Please check back later or
              contact reception.
            </p>
          </div>
        ) : (
          <>
            {!myToken && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <TokenEntry
                  value={tokenInput}
                  onChange={onTokenInput}
                  onSubmit={onSubmitToken}
                  error={tokenError}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Metric
                icon={Users}
                label="Currently serving"
                value={servingEntry ? formatToken(servingEntry.tokenNumber) : '—'}
                tone="brand"
              />
              <Metric
                icon={Clock3}
                label="Your token"
                value={myEntry ? formatToken(myEntry.tokenNumber) : '—'}
                tone="slate"
              />
            </div>

            {myToken && !myEntry && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <p className="text-sm font-semibold text-rose-900">
                  Token #{String(myToken).padStart(3, '0')} isn&apos;t in today&apos;s queue.
                </p>
                <button
                  type="button"
                  onClick={onChangeToken}
                  className="mt-2 text-xs font-bold text-rose-700 underline underline-offset-2"
                >
                  Enter a different token
                </button>
              </div>
            )}

            {myEntry && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Metric icon={Users} label="People ahead" value={peopleAhead} tone="amber" />
                  <Metric
                    icon={Clock3}
                    label="Estimated wait"
                    value={estimate.label}
                    tone="slate"
                  />
                </div>
                <p className="-mt-2 text-center text-[11px] text-slate-400">{estimate.detail}</p>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">Your status</span>
                  <span className="text-xs font-bold text-slate-900">{statusLabel(myEntry.status)}</span>
                </div>
                <StatusMessage entry={myEntry} peopleAhead={peopleAhead} />
                <button
                  type="button"
                  onClick={onChangeToken}
                  className="w-full text-center text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Not your token? Enter a different number
                </button>
              </>
            )}

            {queue.status === QUEUE_STATUS.PAUSED && (
              <p className="flex items-center justify-center gap-2 text-xs font-medium text-amber-700">
                <PauseCircle size={14} /> The queue is currently paused.
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-500" /> Token numbers only — no personal details</span>
        <span>Updates automatically</span>
      </div>
    </div>
  )
}
