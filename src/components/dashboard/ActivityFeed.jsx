import { Activity, RotateCcw } from 'lucide-react'
import { EVENT_LABELS } from '../../utils/constants'
import { formatRelative } from '../../utils/formatters'
import { EmptyState } from '../common/States'

export default function ActivityFeed({ events = [], limit = 6 }) {
  const visible = events.slice(0, limit)
  return (
    <div className="card">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Activity size={17} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          <p className="text-xs text-slate-500">Audit log of staff actions.</p>
        </div>
      </div>
      <div className="px-5 py-4">
        {!visible.length ? (
          <EmptyState icon={Activity} title="No activity yet" description="Queue actions will appear here." />
        ) : (
          <ol className="space-y-4">
            {visible.map((event) => (
              <li key={event.id} className="flex gap-3">
                <span
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    event.undone ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  {event.action === 'UNDO_ACTION' ? <RotateCcw size={13} /> : <Activity size={13} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">
                    {EVENT_LABELS[event.action] || event.action}
                    {event.undone && <span className="ml-1 text-slate-400">(undone)</span>}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {event.performedByName || 'Staff'} · {formatRelative(event.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
