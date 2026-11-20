import { useEffect, useState } from 'react'
import { BellRing, Check, Megaphone, Trash2 } from 'lucide-react'
import Button from '../common/Button'
import { ANNOUNCEMENT_PRESETS } from '../../utils/constants'

export default function AnnouncementPanel({ announcement, busy, onPublish }) {
  const [message, setMessage] = useState(announcement || '')

  useEffect(() => {
    setMessage(announcement || '')
  }, [announcement])

  const applyPreset = (preset) => {
    setMessage(preset.message)
    onPublish(preset.message)
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Megaphone size={17} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Patient announcements</h2>
          <p className="text-xs text-slate-500">Broadcast instantly to the public queue page.</p>
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">
        {announcement && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <BellRing size={14} className="mt-0.5 shrink-0" />
            <span className="flex-1">{announcement}</span>
            <button
              type="button"
              onClick={() => {
                setMessage('')
                onPublish('')
              }}
              aria-label="Clear announcement"
              className="text-amber-700 hover:text-amber-900"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {ANNOUNCEMENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={busy}
              onClick={() => applyPreset(preset)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <textarea
            rows={3}
            maxLength={240}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Or write a custom message for waiting patients…"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus-ring focus:border-brand-400"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{message.length}/240</span>
            <Button
              size="sm"
              disabled={busy || message === announcement}
              onClick={() => onPublish(message)}
            >
              <Check size={14} /> Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
