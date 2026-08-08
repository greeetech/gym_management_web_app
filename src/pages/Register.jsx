import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, Button, Field, NativeSelect, inputClass } from '../components/ui'
import AuthLayout from '../components/AuthLayout'
import { isValidEmail, isValidName, passwordScore, PASSWORD_LABELS } from '../utils/validation'

const PASSWORD_COLORS = [
  'bg-danger-gradient',
  'bg-danger-gradient',
  'bg-warning-gradient',
  'bg-success-gradient',
  'bg-success-gradient',
  'bg-success-gradient',
]

export default function Register() {
  const { register, getErrorMessage } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    gender: '',
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const score = passwordScore(form.password)

  const validate = () => {
    const errs = {}
    if (!isValidName(form.name)) errs.name = 'Full name is required'
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    }
    if (form.address) payload.address = form.address
    if (form.gender) payload.gender = form.gender

    setLoading(true)
    try {
      await register(payload)
      setSuccess('Account created successfully. You can now sign in.')
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        gender: '',
      })
      setErrors({})
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Set up your gym as an owner in under a minute">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        {error && <div className="mb-4"><Alert>{error}</Alert></div>}
        {success && <div className="mb-4"><Alert type="success">{success}</Alert></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" required error={errors.name}>
            <input type="text" value={form.name} onChange={set('name')} placeholder="John Doe" className={inputClass(!!errors.name)} />
          </Field>
          <Field label="Email" required error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputClass(!!errors.email)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Password" required error={errors.password}>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" className={inputClass(!!errors.password)} />
            </Field>
            <Field label="Confirm password" required error={errors.confirmPassword}>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" className={inputClass(!!errors.confirmPassword)} />
            </Field>
          </div>
          {form.password && (
            <div>
              <div className="flex gap-1">
                {PASSWORD_COLORS.slice(0, 5).map((c, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i < score ? c : 'bg-surface-3'}`} />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Strength: <span className="font-semibold text-foreground">{PASSWORD_LABELS[score]}</span>
              </p>
            </div>
          )}
          <Field label="Address (optional)">
            <input type="text" value={form.address} onChange={set('address')} placeholder="Gym address" className={inputClass(false)} />
          </Field>
          <Field label="Gender (optional)">
            <NativeSelect value={form.gender} onChange={set('gender')}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </NativeSelect>
          </Field>
          <Button type="submit" disabled={loading} loading={loading} className="w-full" size="lg">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 transition hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
