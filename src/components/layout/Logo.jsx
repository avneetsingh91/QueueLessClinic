import { Link } from 'react-router-dom'
import { QrCode } from 'lucide-react'

export default function Logo({ compact = false, light = false, to = '/' }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="Queueless home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30 transition-transform group-hover:-rotate-3">
        <QrCode size={18} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
          queueless<span className="text-brand-500">.</span>
        </span>
      )}
    </Link>
  )
}
