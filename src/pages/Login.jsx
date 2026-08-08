import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, Button, Field, inputClass } from '../components/ui'
import { Icon } from '../components/icons'
import AuthLayout from '../components/AuthLayout'

export default function Login() {
  const { login, getErrorMessage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your gym owner account">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        {error && <div className="mb-4"><Alert>{error}</Alert></div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" required>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={set('password')}
                placeholder="Enter your password"
                className={`${inputClass(false)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                <Icon name={showPassword ? 'eye' : 'eye-off'} className="size-5" />
              </button>
            </div>
          </Field>
          <Button type="submit" disabled={loading} loading={loading} className="w-full" size="lg">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Gym Manager?{' '}
        <Link to="/register" className="font-semibold text-brand-600 transition hover:text-brand-700">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
