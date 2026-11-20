import { useState } from 'react'
import { ArrowRight, ChevronRight, Plus, Ticket } from 'lucide-react'
import Button from '../components/common/Button'
import PageHeader from '../components/dashboard/PageHeader'
import QueueControls from '../components/dashboard/QueueControls'
import QueueTable from '../components/dashboard/QueueTable'
import AddTokenModal from '../components/dashboard/AddTokenModal'
import { Card, CardBody, CardHeader } from '../components/common/Card'
import { QueueStatusBadge } from '../components/common/Badge'
import { useQueueContext } from '../context/QueueContext'
import { compareTokens, formatToken } from '../utils/queueHelpers'
import { formatQueueDate } from '../utils/formatters'
import { TOKEN_STATUS } from '../utils/constants'

const filters = [
  { value: 'ALL', label: 'All' },
  { value: TOKEN_STATUS.WAITING, label: 'Waiting' },
  { value: TOKEN_STATUS.SERVING, label: 'Serving' },
  { value: TOKEN_STATUS.COMPLETED, label: 'Completed' },
  { value: TOKEN_STATUS.SKIPPED, label: 'Skipped' },
  { value: TOKEN_STATUS.CANCELLED, label: 'Absent' },
]

export default function LiveQueuePage() {
  const { queue, tokens, actions, busy, lastAction, error } = useQueueContext()
  const [addOpen, setAddOpen] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const sorted = [...tokens].sort(compareTokens)
  const filtered = filter === 'ALL' ? sorted : sorted.filter((token) => token.status === filter)
  const next = sorted.find((token) => token.status === TOKEN_STATUS.WAITING)

  return (
    <>
      <PageHeader
        title="Live queue"
        description={`${formatQueueDate(queue?.queueDate)} · ${queue?.doctorName || 'All doctors'}`}
        actions={
          <>
            {queue?.status && <QueueStatusBadge status={queue.status} />}
            <Button onClick={() => setAddOpen(true)} disabled={busy} variant="secondary">
              <Plus size={16} /> Add token
            </Button>
            <Button onClick={actions.nextToken} disabled={busy}>
              Next token <ChevronRight size={16} />
            </Button>
          </>
        }
      />

      {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {lastAction && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-brand-900">Recent action: {lastAction.action.replaceAll('_', ' ').toLowerCase()}</p>
            <p className="mt-0.5 text-[11px] text-brand-700">
              Performed by {lastAction.performedByName || 'staff'}. Undo is available.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={actions.undo} disabled={busy}>
            Undo last action
          </Button>
        </div>
      )}

      <div className="mb-4">
        <QueueControls
          queue={queue}
          busy={busy}
          lastAction={lastAction}
          onStatus={actions.setStatus}
          onReset={actions.resetQueue}
          onUndo={actions.undo}
        />
      </div>

      <Card>
        <CardHeader
          title="Token queue"
          description={`${tokens.length} tokens in today's queue${next ? ` · Next up ${formatToken(next.tokenNumber)}` : ''}`}
          action={
            <div className="flex flex-wrap gap-1.5">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    filter === item.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          }
        />
        <CardBody className="p-0">
          <QueueTable
            tokens={filtered}
            busy={busy}
            onSkip={actions.skipToken}
            onComplete={actions.completeToken}
            onRecall={actions.recallToken}
            onAbsent={actions.markAbsent}
          />
        </CardBody>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
        <span className="flex items-center gap-2"><Ticket size={14} className="text-brand-500" /> Only one token can be actively serving at a time.</span>
        <span className="flex items-center gap-1">
          Manage staff and clinic settings <ArrowRight size={13} />{' '}
          <a href="/dashboard/settings" className="font-semibold text-brand-600">Settings</a>
        </span>
      </div>

      <AddTokenModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onIssue={(count) => actions.issueTokens(count)}
        nextNumber={(Number(queue?.currentTokenNumber) || 0) + 1}
        busy={busy}
      />
    </>
  )
}
