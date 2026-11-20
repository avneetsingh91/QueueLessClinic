import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import Button from '../common/Button'
import { ConfirmDialog } from '../common/Modal'
import { QUEUE_STATUS } from '../../utils/constants'

const statuses = [
  { value: QUEUE_STATUS.OPEN, label: 'Open' },
  { value: QUEUE_STATUS.PAUSED, label: 'Paused' },
  { value: QUEUE_STATUS.CLOSED, label: 'Closed' },
]

export default function QueueControls({ queue, busy, lastAction, onStatus, onReset, onUndo }) {
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <div className="card flex flex-wrap items-center justify-between gap-4 p-3">
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-slate-500 sm:inline">Queue status</span>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {statuses.map((status) => (
              <button
                key={status.value}
                type="button"
                disabled={busy}
                onClick={() => onStatus(status.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  queue?.status === status.value
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onUndo}
            disabled={!lastAction || busy}
            title={lastAction ? `Undo: ${lastAction.action}` : 'No recent action to undo'}
          >
            <RotateCcw size={14} /> Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => setConfirmReset(true)}
            disabled={busy}
          >
            <Trash2 size={14} /> Reset daily queue
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false)
          onReset()
        }}
        title="Reset today's queue?"
        message="All active tokens will be cancelled and token numbering will restart at #001. This affects the patient-facing page. You can undo this immediately afterwards."
        confirmLabel="Reset queue"
        destructive
        loading={busy}
      />
    </>
  )
}
