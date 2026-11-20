import { useEffect, useState } from 'react'
import { Check, Plus, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/common/Button'
import PageHeader from '../components/dashboard/PageHeader'
import { Card, CardBody, CardHeader } from '../components/common/Card'
import { EmptyState } from '../components/common/States'
import { FormField, inputClass } from '../components/common/Feedback'
import { watchDoctors, addDoctor, updateDoctor } from '../services/clinicService'
import { useAuth } from '../hooks/useAuth'
import { useQueueContext } from '../context/QueueContext'
import { friendlyFirestoreError } from '../services/firebase'

export default function DoctorsPage() {
  const { clinicId } = useAuth()
  const { queue, actions, busy } = useQueueContext()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', department: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!clinicId) return undefined
    return watchDoctors(
      clinicId,
      (next) => {
        setDoctors(next)
        setLoading(false)
      },
      () => {
        toast.error('Unable to load doctors.')
        setLoading(false)
      },
    )
  }, [clinicId])

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await addDoctor(clinicId, form)
      setForm({ name: '', department: '' })
      toast.success('Doctor added.')
    } catch (error) {
      toast.error(friendlyFirestoreError(error))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (doctor) => {
    try {
      await updateDoctor(doctor.id, { isActive: !doctor.isActive })
      toast.success(doctor.isActive ? 'Doctor deactivated.' : 'Doctor activated.')
    } catch (error) {
      toast.error(friendlyFirestoreError(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Doctors & departments"
        description="Manage your team and choose who appears on the patient queue page."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Team members" description={`${doctors.length} doctors registered`} />
            <CardBody className="p-0">
              {loading ? (
                <p className="p-6 text-sm text-slate-500">Loading doctors…</p>
              ) : !doctors.length ? (
                <div className="p-5">
                  <EmptyState
                    icon={Stethoscope}
                    title="No doctors added"
                    description="Add a doctor to show their name on the public queue page."
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {doctors.map((doctor) => {
                    const active = queue?.doctorName === doctor.name
                    return (
                      <div key={doctor.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                            <Stethoscope size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{doctor.name}</p>
                            <p className="text-xs text-slate-500">
                              {doctor.department || 'No department'} · {doctor.isActive ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {active && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <Check size={12} /> On queue page
                            </span>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={busy || active || !doctor.isActive}
                            onClick={() => actions.setDoctor(doctor.name, doctor.department)}
                          >
                            Set as current
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggle(doctor)}>
                            {doctor.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Add a doctor" description="Doctors are private staff records." />
          <CardBody>
            <form onSubmit={handleAdd} className="space-y-4">
              <FormField label="Full name">
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Dr. Ananya Mehta"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Department">
                <input
                  value={form.department}
                  onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                  placeholder="e.g. General OPD"
                  className={inputClass}
                />
              </FormField>
              <Button type="submit" className="w-full" loading={saving}>
                <Plus size={15} /> Add doctor
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
