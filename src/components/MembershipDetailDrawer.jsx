import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import { useToast } from './Toast'
import StatusBadge from './StatusBadge'
import Spinner from './Spinner'
import { Alert, Button, Field } from './ui'
import { formatDate, formatINR, initials } from '../utils/format'

const UPDATEABLE_STATUSES = ['Active', 'Inactive', 'Cancelled']

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value || '—'}</span>
    </div>
  )
}

export default function MembershipDetailDrawer({ open, membershipId, onClose, onChanged, onRenew }) {
  const toast = useToast()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusValue, setStatusValue] = useState('Active')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!open || !membershipId) {
      setDetail(null)
      setLoading(false)
      setError('')
      return undefined
    }
    let cancelled = false
    setLoading(true)
    setError('')
    setSaveError('')
    api
      .get(`/memberships/${membershipId}`)
      .then((res) => {
        if (cancelled) return
        setDetail(res.data.data)
        setStatusValue(UPDATEABLE_STATUSES.includes(res.data.data.status) ? res.data.data.status : 'Active')
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, membershipId])

  const handleSave = async () => {
    setSaveError('')
    setSaving(true)
    try {
      await api.put(`/memberships/${membershipId}`, { status: statusValue })
      toast.success(`Membership marked as ${statusValue}`)
      onChanged?.()
      onClose()
    } catch (err) {
      setSaveError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const member = detail?.gymMemberId
  const plan = detail?.subscriptionId

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-overlay backdrop-blur-sm transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Membership details"
        className={`absolute inset-y-0 right-0 w-full max-w-md transform bg-surface shadow-2xl transition-transform duration-200 sm:max-w-lg ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-base font-bold text-foreground">Membership details</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <Alert>{error}</Alert>
            ) : detail ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  {member?.profileImage?.url ? (
                    <img src={member.profileImage.url} alt={member.fullName} className="h-14 w-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-extrabold text-white">
                      {initials(member?.fullName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-foreground">{member?.fullName || 'Unknown member'}</p>
                    <p className="truncate text-sm text-muted-foreground">{member?.email}</p>
                    <p className="text-xs text-muted-foreground">{member?.phone}</p>
                  </div>
                </div>

                {member && (
                  <Link
                    to={`/members/${member._id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                  >
                    View member profile
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}

                <div className="rounded-xl bg-gradient-to-br from-slate-900 to-brand-950 p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-extrabold">{detail.name}</p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold">{formatINR(detail.price)}</span>
                        {detail.grossPrice > detail.price && (
                          <span className="text-sm text-white/50 line-through">{formatINR(detail.grossPrice)}</span>
                        )}
                        <span className="text-sm text-white/60">/ {detail.duration}</span>
                      </div>
                    </div>
                    <StatusBadge status={detail.status} />
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Plan details</p>
                  <Row label="Plan" value={plan?.name || detail.name} />
                  <Row label="Gross price" value={formatINR(detail.grossPrice)} />
                  <Row label="Price" value={formatINR(detail.price)} />
                  <Row label="Duration" value={detail.duration} />
                  <Row label="Start date" value={formatDate(detail.startDate)} />
                  <Row label="End date" value={formatDate(detail.endDate)} />
                  <Row label="Status" value={detail.status} />
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Update status</p>
                  {saveError && <div className="mb-3"><Alert>{saveError}</Alert></div>}
                  <Field label="Status">
                    <div className="grid grid-cols-1 gap-2">
                      {UPDATEABLE_STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatusValue(s)}
                          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                            statusValue === s
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-border bg-surface text-muted-foreground hover:bg-surface-2'
                          }`}
                        >
                          {s}
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${statusValue === s ? 'border-brand-600' : 'border-border'}`}>
                            {statusValue === s && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" onClick={handleSave} loading={saving}>
                      {saving ? 'Saving...' : 'Save status'}
                    </Button>
                  </div>
                </div>

                {onRenew && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      onRenew(detail)
                    }}
                  >
                    Renew membership
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
