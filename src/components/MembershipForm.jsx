import { useEffect, useRef, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import { useToast } from './Toast'
import Modal from './Modal'
import { Alert, Button, Field, inputClass } from './ui'
import { formatDate, formatINR, initials } from '../utils/format'

const DURATION_MONTHS = { Monthly: 1, Quarterly: 3, 'Half Yearly': 6, Yearly: 12 }

function addMonths(date, months) {
  const d = new Date(date)
  const day = d.getDate()
  d.setMonth(d.getMonth() + months)
  if (d.getDate() !== day) d.setDate(0)
  return d
}

function computeEndDate(startISO, duration) {
  const start = new Date(startISO)
  start.setHours(0, 0, 0, 0)
  const months = DURATION_MONTHS[duration] || 1
  const end = addMonths(start, months)
  end.setDate(end.getDate() - 1)
  return end
}

export default function MembershipForm({ open, onClose, memberId, members, plans, onSuccess }) {
  const toast = useToast()
  const wasOpen = useRef(false)
  const [form, setForm] = useState({ memberId: '', subscriptionId: '', startDate: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const opening = open && !wasOpen.current
    wasOpen.current = open
    if (!opening) return
    setForm({
      memberId: memberId || '',
      subscriptionId: '',
      startDate: new Date().toISOString().slice(0, 10),
    })
    setErrors({})
    setFormError('')
  }, [open, memberId])

  const selectedPlan = plans.find((p) => p._id === form.subscriptionId) || null
  const selectedMember = members.find((m) => m._id === form.memberId) || null
  const hasActiveMembership = ['Active', 'Pending', 'Expiry Soon'].includes(selectedMember?.membershipId?.status)
  const endDate = selectedPlan && form.startDate ? computeEndDate(form.startDate, selectedPlan.duration) : null
  const pastDate = form.startDate ? new Date(form.startDate) < new Date(new Date().toDateString()) : false

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.memberId) errs.memberId = 'Select a member'
    if (!form.subscriptionId) errs.subscriptionId = 'Select a plan'
    if (!form.startDate) errs.startDate = 'Pick a start date'
    else if (pastDate) errs.startDate = 'Start date cannot be in the past'
    if (hasActiveMembership) errs.memberId = 'This member already has an active or pending membership'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    setFormError('')
    try {
      await api.post(`/subscription/new/members/${form.memberId}`, {
        subscriptionId: form.subscriptionId,
        startDate: form.startDate,
      })
      toast.success('Membership created successfully')
      onSuccess?.()
      onClose()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const memberReadout = selectedMember ? (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-card">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
        {initials(selectedMember.fullName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{selectedMember.fullName}</p>
        <p className="truncate text-xs text-muted-foreground">{selectedMember.phone} · {selectedMember.email}</p>
      </div>
      <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-700 ring-1 ring-inset ring-success-200">
        Selected
      </span>
    </div>
  ) : null

  return (
    <Modal open={open} title="New Membership" onClose={onClose} size="md">
      {formError && <div className="mb-4"><Alert>{formError}</Alert></div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Member" required error={errors.memberId}>
          {memberId ? (
            memberReadout
          ) : (
            <select value={form.memberId} onChange={set('memberId')} className={inputClass(!!errors.memberId)}>
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.phone})
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Subscription plan" required error={errors.subscriptionId}>
          <select value={form.subscriptionId} onChange={set('subscriptionId')} className={inputClass(!!errors.subscriptionId)}>
            <option value="">Select plan</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.duration} - ₹{p.price})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Start date" required error={errors.startDate}>
          <input type="date" value={form.startDate} onChange={set('startDate')} className={inputClass(!!errors.startDate)} />
        </Field>

        {selectedPlan && (
          <div className="rounded-xl border border-border bg-surface-2/60 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Plan summary</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold text-foreground">{selectedPlan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold text-foreground">{formatINR(selectedPlan.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Gross price</span>
                <span className="text-muted-foreground">{formatINR(selectedPlan.grossPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold text-foreground">{selectedPlan.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Valid till</span>
                <span className="font-semibold text-foreground">{formatDate(endDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-muted-foreground">Auto</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>{submitting ? 'Creating...' : 'Create membership'}</Button>
        </div>
      </form>
    </Modal>
  )
}
