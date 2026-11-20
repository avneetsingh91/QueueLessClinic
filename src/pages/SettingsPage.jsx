import { useEffect, useState } from 'react'
import { Save, ShieldCheck, Users } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/common/Button'
import PageHeader from '../components/dashboard/PageHeader'
import QRCodeCard from '../components/dashboard/QRCodeCard'
import { Card, CardBody, CardHeader } from '../components/common/Card'
import { FormField, inputClass } from '../components/common/Feedback'
import { Badge } from '../components/common/Badge'
import { watchStaff, updateClinic, updateUserRole } from '../services/clinicService'
import { useAuth } from '../hooks/useAuth'
import { useQueueContext } from '../context/QueueContext'
import { friendlyFirestoreError } from '../services/firebase'
import { ROLES } from '../utils/constants'

const emptyForm = {
  name: '',
  address: '',
  contactNumber: '',
  email: '',
  doctorName: '',
  department: '',
  averageConsultationMinutes: 8,
}

export default function SettingsPage() {
  const { clinicId, user, isAdmin } = useAuth()
  const { clinic, actions, busy } = useQueueContext()
  const [form, setForm] = useState(emptyForm)
  const [staff, setStaff] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!clinic) return
    setForm({
      name: clinic.name || '',
      address: clinic.address || '',
      contactNumber: clinic.contactNumber || '',
      email: clinic.email || '',
      doctorName: clinic.doctorName || '',
      department: clinic.department || '',
      averageConsultationMinutes: Number(clinic.averageConsultationMinutes) || 8,
    })
  }, [clinic])

  useEffect(() => {
    if (!clinicId) return undefined
    return watchStaff(
      clinicId,
      setStaff,
      () => toast.error('Unable to load staff members.'),
    )
  }, [clinicId])

  const setField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await updateClinic(clinicId, form)
      await actions.setAverage(form.averageConsultationMinutes)
      await actions.setDoctor(form.doctorName, form.department)
      await actions.setAnnouncement(clinic?.announcement || '')
      toast.success('Clinic settings saved.')
    } catch (error) {
      toast.error(friendlyFirestoreError(error))
    } finally {
      setSaving(false)
    }
  }

  const changeRole = async (uid, role) => {
    try {
      await updateUserRole(uid, role)
      toast.success('Staff role updated.')
    } catch (error) {
      toast.error(friendlyFirestoreError(error))
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Clinic profile, queue defaults, staff access, and your public link."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Clinic profile" description="This information is private to your staff team." />
            <CardBody>
              <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
                <FormField label="Clinic name" className="sm:col-span-2">
                  <input required value={form.name} onChange={setField('name')} className={inputClass} />
                </FormField>
                <FormField label="Contact email">
                  <input type="email" value={form.email} onChange={setField('email')} className={inputClass} />
                </FormField>
                <FormField label="Contact number">
                  <input value={form.contactNumber} onChange={setField('contactNumber')} className={inputClass} />
                </FormField>
                <FormField label="Address" className="sm:col-span-2">
                  <input value={form.address} onChange={setField('address')} className={inputClass} />
                </FormField>
                <FormField label="Default doctor">
                  <input value={form.doctorName} onChange={setField('doctorName')} className={inputClass} />
                </FormField>
                <FormField label="Default department">
                  <input value={form.department} onChange={setField('department')} className={inputClass} />
                </FormField>
                <FormField
                  label="Fallback consultation time (minutes)"
                  hint="Used until enough consultations are completed to calculate a rolling average."
                  className="sm:col-span-2"
                >
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.averageConsultationMinutes}
                    onChange={setField('averageConsultationMinutes')}
                    className={inputClass}
                  />
                </FormField>
                <div className="sm:col-span-2">
                  <Button type="submit" loading={saving || busy} disabled={!isAdmin}>
                    <Save size={15} /> Save settings
                  </Button>
                  {!isAdmin && (
                    <p className="mt-2 text-xs text-amber-600">
                      Only clinic admins can change these settings.
                    </p>
                  )}
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Staff access"
              description="Admins manage settings and staff; receptionists run the queue."
              action={<Users size={16} className="text-slate-400" />}
            />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {member.name || member.email}{' '}
                        {member.id === user?.uid && (
                          <span className="text-[11px] font-normal text-slate-400">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={member.role === ROLES.ADMIN ? 'brand' : 'slate'}>
                        {member.role === ROLES.ADMIN ? 'Admin' : 'Receptionist'}
                      </Badge>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            changeRole(
                              member.id,
                              member.role === ROLES.ADMIN ? ROLES.RECEPTIONIST : ROLES.ADMIN,
                            )
                          }
                        >
                          Make {member.role === ROLES.ADMIN ? 'receptionist' : 'admin'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-500" size={18} />
              <div>
                <p className="text-sm font-semibold text-slate-900">Security is enforced in Firestore</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Staff can only read and write their own clinic&apos;s data. Patients can only read a
                  sanitized public queue document that contains token numbers and status — never
                  names, phone numbers, or medical information.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <QRCodeCard slug={clinic?.publicSlug} clinicName={clinic?.name} />
      </div>
    </>
  )
}
