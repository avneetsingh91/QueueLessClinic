import { QUEUE_STATUS_STYLES, TOKEN_STATUS_STYLES } from '../../utils/constants'
import { queueStatusLabel, statusLabel } from '../../utils/queueHelpers'

export function Badge({ children, className = '', tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 ring-slate-200',
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    red: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function TokenStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${TOKEN_STATUS_STYLES[status] || TOKEN_STATUS_STYLES.WAITING}`}
    >
      {statusLabel(status)}
    </span>
  )
}

export function QueueStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${QUEUE_STATUS_STYLES[status] || QUEUE_STATUS_STYLES.OPEN}`}
    >
      {queueStatusLabel(status)}
    </span>
  )
}
