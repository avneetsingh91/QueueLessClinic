import { Navigate, useLocation } from 'react-router-dom'
import { LoadingScreen } from '../components/common/Feedback'
import { useAuth } from '../hooks/useAuth'
import { isFirebaseConfigured } from '../services/firebase'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="card max-w-md p-6 text-center">
          <h1 className="text-lg font-bold text-slate-900">Firebase setup required</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Copy <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.example</code> to{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">.env</code>, add your Firebase web
            app values, then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  if (loading) return <LoadingScreen message="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
