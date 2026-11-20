import Navbar from './Navbar'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-700 p-10 text-white md:flex md:flex-col md:justify-between">
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">For clinic teams</span>
              <h2 className="mt-8 text-3xl font-bold leading-tight">
                A better queue is a better visit.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Manage tokens, call patients, and keep everyone informed — from one calm dashboard.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/85">
              {['Real-time updates', 'Role-based access', 'Patient privacy built in'].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="px-6 py-10 sm:px-10">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
