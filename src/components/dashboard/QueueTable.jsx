import {
  CheckCircle2,
  CircleSlash2,
  RotateCcw,
  UserX,
  UserRoundCheck,
} from 'lucide-react'
import { TokenStatusBadge } from '../common/Badge'
import { EmptyState } from '../common/States'
import { formatToken } from '../../utils/queueHelpers'
import { formatTime } from '../../utils/formatters'
import { TOKEN_STATUS } from '../../utils/constants'

function ActionButton({ icon: Icon, label, onClick, disabled, tone = 'slate' }) {
  const tones = {
    slate: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    brand: 'text-brand-600 hover:bg-brand-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    red: 'text-rose-600 hover:bg-rose-50',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-30 ${tones[tone]}`}
    >
      <Icon size={15} />
    </button>
  )
}

export default function QueueTable({ tokens = [], busy, onSkip, onComplete, onRecall, onAbsent }) {
  if (!tokens.length) {
    return (
      <EmptyState
        title="No tokens yet"
        description="Issue the first token to start the queue. Patients will see updates immediately."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3 font-semibold">Token</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Created at</th>
            <th className="px-5 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tokens.map((token) => (
            <tr
              key={token.id}
              className={`transition-colors hover:bg-slate-50/70 ${
                token.status === TOKEN_STATUS.SERVING ? 'bg-brand-50/40' : ''
              }`}
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{formatToken(token.tokenNumber)}</span>
                  {token.isRecalled && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      RECALLED
                    </span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3">
                <TokenStatusBadge status={token.status} />
              </td>
              <td className="px-5 py-3 text-xs text-slate-500">{formatTime(token.createdAt)}</td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-1">
                  {(token.status === TOKEN_STATUS.WAITING || token.status === TOKEN_STATUS.SERVING) && (
                    <>
                      <ActionButton
                        icon={CheckCircle2}
                        label="Complete consultation"
                        tone="brand"
                        disabled={busy || token.status !== TOKEN_STATUS.SERVING}
                        onClick={() => onComplete(token.id)}
                      />
                      <ActionButton
                        icon={CircleSlash2}
                        label="Skip token"
                        tone="amber"
                        disabled={busy}
                        onClick={() => onSkip(token.id)}
                      />
                      <ActionButton
                        icon={UserX}
                        label="Mark patient absent"
                        tone="red"
                        disabled={busy}
                        onClick={() => onAbsent(token.id)}
                      />
                    </>
                  )}
                  {(token.status === TOKEN_STATUS.SKIPPED ||
                    token.status === TOKEN_STATUS.CANCELLED) && (
                    <ActionButton
                      icon={RotateCcw}
                      label="Recall token"
                      tone="brand"
                      disabled={busy}
                      onClick={() => onRecall(token.id)}
                    />
                  )}
                  {token.status === TOKEN_STATUS.COMPLETED && (
                    <span className="flex h-8 w-8 items-center justify-center text-emerald-500">
                      <UserRoundCheck size={15} />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
