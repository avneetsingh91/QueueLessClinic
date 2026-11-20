import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { toast } from 'sonner'
import AuthShell from '../components/layout/AuthShell'
import Button from '../components/common/Button'
import { FormField, inputClass } from '../components/common/Feedback'
import { friendlyAuthError, isFirebaseConfigured } from '../services/firebase'
import { login, resetPassword } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetting, setResetting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back.')
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      toast.error(friendlyAuthError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email.trim()) {
      toast.error('Enter your email address first.')
      return
    }
    setResetting(true)
    try {
      await resetPassword(email)
      toast.success('Password reset link sent.')
    } catch (error) {
      toast.error(friendlyAuthError(error))
    } finally {
      setResetting(false)
    }
  }

  return (
    <AuthShell
      title="Staff sign in"
      subtitle="Sign in with the account created for your clinic."
      footer={
        <p>
          New to Queueless?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Register your clinic
          </Link>
        </p>
      }
    >
      {!isFirebaseConfigured && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Firebase is not configured. Add your values to <code>.env</code> before signing in.
        </div>
      )}
      {profile?.role === 'receptionist' && (
        <p className="mb-5 rounded-lg bg-brand-50 p-3 text-xs text-brand-700">
          You are signed in as a receptionist.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Work email">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@clinic.com"
              className={`${inputClass} pl-10`}
            />
          </div>
        </FormField>
        <FormField label="Password">
          <div className="relative">
            <LockKeyhole size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pl-10`}
            />
          </div>
        </FormField>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            {resetting ? 'Sending link…' : 'Forgot password?'}
          </button>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign in to dashboard <ArrowRight size={16} />
        </Button>
      </form>
    </AuthShell>
  )
}
