import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  QrCode,
  Settings,
  Stethoscope,
  Ticket,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Logo from './Logo'
import { QueueStatusBadge } from '../common/Badge'
import { useAuth } from '../../hooks/useAuth'
import { useQueueContext } from '../../context/QueueContext'
import { logout } from '../../services/authService'
import { initials } from '../../utils/queueHelpers'

const navigation = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Live Queue', to: '/dashboard/live', icon: ListOrdered },
  { label: 'Token Management', to: '/dashboard/tokens', icon: Ticket },
  { label: 'Doctors / Departments', to: '/dashboard/doctors', icon: Stethoscope, adminOnly: true },
  { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings, adminOnly: true },
]

function SidebarContent({ onNavigate, isAdmin, publicSlug }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navigation
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={17} />
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-30" />
            </NavLink>
          ))}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <Link
          to={publicSlug ? `/queue/${publicSlug}` : '/'}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
        >
          <QrCode size={17} />
          Patient view
        </Link>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, user, isAdmin } = useAuth()
  const { clinic, queue } = useQueueContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out.')
      navigate('/login')
    } catch (error) {
      toast.error(error?.message || 'Unable to sign out.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent isAdmin={isAdmin} publicSlug={clinic?.publicSlug} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="animate-fade-up absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            <SidebarContent
              isAdmin={isAdmin}
              publicSlug={clinic?.publicSlug}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {clinic?.name || 'Loading clinic…'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {clinic?.publicSlug ? `queueless.app/queue/${clinic.publicSlug}` : 'Live queue dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {queue?.status && <QueueStatusBadge status={queue.status} />}
            </div>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {initials(profile?.name || user?.displayName)}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-slate-800">
                  {profile?.name || user?.displayName || 'Staff'}
                </p>
                <p className="text-[11px] capitalize text-slate-400">{profile?.role || 'staff'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-ring"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
