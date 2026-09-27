import { useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import { useToast } from '../components/Toast'
import { Alert, Avatar, Button, Card, Field, PageHeader, NativeSelect, inputClass } from '../components/ui'
import { PlanUsageCard } from '../components/PlanUsage'
import WhatsAppGatewayModal from '../components/WhatsAppGatewayModal'
import { Icon } from '../components/icons'
import { isValidEmail, isValidName } from '../utils/validation'

const GENDERS = ['male', 'female', 'other']

export default function Settings() {
  const { user, refreshProfile } = useAuth()
  const sub = useOwnerSubscription()
  const toast = useToast()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    gender: user?.gender || '',
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [gwStatus, setGwStatus] = useState('DISCONNECTED')
  const [gwPhone, setGwPhone] = useState(null)

  const checkGw = async () => {
    try {
      const res = await api.get('/whatsapp-gateway/status')
      setGwStatus(res.data?.data?.status || 'DISCONNECTED')
      if (res.data?.data?.phone) setGwPhone(res.data.data.phone)
    } catch (_) {}
  }

  useState(() => { checkGw() })

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!isValidName(form.name)) errs.name = 'Full name is required'
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setError('')
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
      }
      if (form.address !== undefined) payload.address = form.address
      if (form.gender !== undefined) payload.gender = form.gender

      await api.put('/profile', payload)
      await refreshProfile()
      toast.success('Profile updated successfully')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update profile'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your gym owner account" breadcrumb="Account" />

      <div className="mb-6">
        <PlanUsageCard sub={sub.current} />
      </div>
      <div className="mb-6">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface-2/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-success-500/10 text-success-600 dark:text-success-400">
                <Icon name="message-circle" className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">WhatsApp Multi-Device Gateway</h3>
                <p className="text-xs text-muted-foreground">Deliver official PDF invoices & receipts directly from your gym WhatsApp</p>
              </div>
            </div>

            <div>
              {gwStatus === 'CONNECTED' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 dark:bg-success-950/40 dark:text-success-300">
                  <span className="size-2 rounded-full bg-success-500 animate-pulse" />
                  Connected (+{gwPhone || 'Active'})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Not Linked
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              When linked, our server uses in-memory dynamic PDF generation (Zero Cloudinary) to dispatch official PDF document attachments directly to member WhatsApp chats upon registration and renewal.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={() => setQrModalOpen(true)}>
                <Icon name="qrcode" className="size-4" />
                {gwStatus === 'CONNECTED' ? 'Manage WhatsApp Session' : 'Link WhatsApp (Scan QR)'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <WhatsAppGatewayModal
        open={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false)
          checkGw()
        }}
      />


      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 border-b border-border-subtle bg-surface-2/60 px-6 py-5">
          <Avatar
            name={user?.name}
            alt={user?.name}
            className="size-16 rounded-2xl text-xl font-extrabold shadow-sm"
          />
          <div>
            <p className="text-base font-bold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-400">
              Gym Owner
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && <Alert>{error}</Alert>}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              <input value={form.name} onChange={set('name')} className={inputClass(!!errors.name)} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input type="email" value={form.email} onChange={set('email')} className={inputClass(!!errors.email)} />
            </Field>
            <Field label="Address" hint="Optional">
              <input value={form.address} onChange={set('address')} placeholder="Gym address" className={inputClass(false)} />
            </Field>
            <Field label="Gender" hint="Optional">
              <NativeSelect value={form.gender} onChange={set('gender')}>
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div className="flex justify-end border-t border-border-subtle pt-5">
            <Button type="submit" loading={loading} size="lg">
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
