import { useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import { useToast } from '../components/Toast'
import { Alert, Avatar, Button, Card, Field, PageHeader, NativeSelect, inputClass } from '../components/ui'
import { PlanUsageCard } from '../components/PlanUsage'
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
