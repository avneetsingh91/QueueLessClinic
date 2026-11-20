import { Link } from 'react-router-dom'
import { Code2, HeartPulse, Mail } from 'lucide-react'
import Logo from './Logo'

const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            A calmer way to wait. Queueless gives clinics a live token queue and gives patients their
            time back — no app, no account, no crowding.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <HeartPulse size={14} className="text-rose-400" />
            Built for clinics, laboratories, and OPDs of every size.
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Product</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li><a href="/#how-it-works" className="hover:text-brand-600">How it works</a></li>
            <li><a href="/#features" className="hover:text-brand-600">Features</a></li>
            <li><Link to="/register" className="hover:text-brand-600">For clinics</Link></li>
            <li><Link to="/login" className="hover:text-brand-600">Staff dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-2"><Mail size={14} /> hello@queueless.app</li>
            <li className="flex items-center gap-2"><Code2 size={14} /> Open source foundations</li>
            <li>Privacy-first by design</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {currentYear} Queueless. Patient privacy is never a feature flag.
      </div>
    </footer>
  )
}
