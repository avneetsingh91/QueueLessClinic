import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowRight, Building2, CheckCircle2, Copy, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import AuthShell from '../components/layout/AuthShell'
import Button from '../components/common/Button'
import { FormField, inputClass } from '../components/common/Feedback'
import { generateSlug, registerClinic } from '../services/authService'
import { friendlyAuthError, isFirebaseConfigured, publicQueueUrl } from '../services/firebase'

const emptyForm = {
  clinicName: '',
  slug: '',
  address: '',
  contactNumber: '',
  doctorName: '',
  department: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState(emptyForm)
  const [slugEdited, setSlugEdited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const previewUrl = useMemo(
    () => (form.slug ? publicQueueUrl(form.slug) : publicQueueUrl('your-clinic')),
    [form.slug],
  )

  const setField = (field) => (event) => {
    const value = event.target.value
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'clinicName' && !slugEdited) next.slug = generateSlug(value).split('-').slice(0, -1).join('-')
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      toast.error('Public link may only use lowercase letters, numbers, and hyphens.')
      return
    }
    setLoading(true)
    try {
      const created = await registerClinic({
        ...form,
        slug: form.slug,
      })
      setResult(created)
      toast.success('Your clinic is ready.')
    } catch (error) {
      toast.error(friendlyAuthError(error))
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (!result) return
    await navigator.clipboard?.writeText(publicQueueUrl(result.slug))
    toast.success('Public queue link copied.')
  }

  if (result) {
    return (
      <AuthShell title="Your clinic is live" subtitle="Print this QR code and place it at reception.">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Patients can scan this code to reach your public queue page. No app or account needed.
          </p>
          <div className="mx-auto mt-6 w-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <QRCodeSVG value={publicQueueUrl(result.slug)} size={180} level="M" includeMargin />
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left">
            <Link2 size={15} className="shrink-0 text-slate-400" />
            <span className="min-w-0 flex-1 truncate text-xs text-slate-700">
              {publicQueueUrl(result.slug)}
            </span>
            <button type="button" onClick={copyLink} aria-label="Copy link" className="text-slate-500 hover:text-brand-600">
              <Copy size={15} />
            </button>
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={() => navigate('/dashboard')}>
            Open dashboard <ArrowRight size={16} />
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create your clinic"
      subtitle="Set up your workspace and public queue link in under two minutes."
      footer={
        <p>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      }
    >
      {!isFirebaseConfigured && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Firebase is not configured. Add your values to <code>.env</code> before registering.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Clinic name" className="sm:col-span-2">
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                required
                value={form.clinicName}
                onChange={setField('clinicName')}
                placeholder="City Care Clinic"
                className={`${inputClass} pl-10`}
              />
            </div>
          </FormField>
          <FormField
            label="Public queue link"
            hint={previewUrl}
            className="sm:col-span-2"
          >
            <div className="flex items-center">
              <span className="rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                /queue/
              </span>
              <input
                required
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true)
                  setForm((current) => ({
                    ...current,
                    slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  }))
                }}
                placeholder="city-care-clinic"
                className={`${inputClass} rounded-l-none font-mono text-xs`}
              />
            </div>
          </FormField>
          <FormField label="Address" className="sm:col-span-2">
            <input value={form.address} onChange={setField('address')} placeholder="Optional" className={inputClass} />
          </FormField>
          <FormField label="Contact number">
            <input value={form.contactNumber} onChange={setField('contactNumber')} placeholder="Optional" className={inputClass} />
          </FormField>
          <FormField label="Department">
            <input value={form.department} onChange={setField('department')} placeholder="e.g. OPD" className={inputClass} />
          </FormField>
          <FormField label="Primary doctor" className="sm:col-span-2">
            <input value={form.doctorName} onChange={setField('doctorName')} placeholder="e.g. Dr. Ananya Mehta" className={inputClass} />
          </FormField>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Administrator account</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Your full name" className="sm:col-span-2">
              <input required value={form.name} onChange={setField('name')} placeholder="Clinic administrator" className={inputClass} />
            </FormField>
            <FormField label="Email" className="sm:col-span-2">
              <input required type="email" autoComplete="email" value={form.email} onChange={setField('email')} placeholder="admin@clinic.com" className={inputClass} />
            </FormField>
            <FormField label="Password">
              <input required type="password" minLength={6} autoComplete="new-password" value={form.password} onChange={setField('password')} className={inputClass} />
            </FormField>
            <FormField label="Confirm password">
              <input required type="password" minLength={6} autoComplete="new-password" value={form.confirmPassword} onChange={setField('confirmPassword')} className={inputClass} />
            </FormField>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create clinic & public queue <ArrowRight size={16} />
        </Button>
      </form>
    </AuthShell>
  )
}
