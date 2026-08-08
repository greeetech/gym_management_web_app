import { useEffect, useRef, useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import { useToast } from './Toast'
import Modal from './Modal'
import { Alert, Button, Field, inputClass } from './ui'
import { isValidEmail, isValidName, isValidPhone } from '../utils/validation'

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  age: '',
  weight: '',
  gender: 'Male',
  subscriptionId: '',
  startDate: '',
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 4 * 1024 * 1024

function fieldError(errors, key) {
  return errors[key]
}

export default function MemberForm({ open, onClose, mode, member, plans, plansLoading, plansError, onSuccess }) {
  const toast = useToast()
  const wasOpen = useRef(false)
  const prevUrl = useRef('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [picFile, setPicFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const opening = open && !wasOpen.current
    wasOpen.current = open
    if (!opening) return

    if (prevUrl.current) URL.revokeObjectURL(prevUrl.current)
    prevUrl.current = ''

    if (mode === 'edit' && member) {
      setForm({
        fullName: member.fullName || '',
        phone: member.phone || '',
        email: member.email || '',
        age: member.age ?? '',
        weight: member.weight ?? '',
        gender: member.gender || 'Male',
        subscriptionId: member.subscriptionId || '',
        startDate: '',
      })
      setPreview(member.profileImage?.url || '')
    } else {
      setForm({ ...EMPTY_FORM, startDate: new Date().toISOString().slice(0, 10) })
      setPreview('')
    }
    setPicFile(null)
    setErrors({})
    setFormError('')
  }, [open, mode, member])

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED.includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: 'Unsupported type. Use JPEG, PNG or WebP.' }))
      return
    }
    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({ ...prev, photo: 'Image size exceeds 4 MB limit.' }))
      return
    }
    if (prevUrl.current) URL.revokeObjectURL(prevUrl.current)
    const url = URL.createObjectURL(file)
    prevUrl.current = url
    setPicFile(file)
    setPreview(url)
    setErrors((prev) => ({ ...prev, photo: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!isValidName(form.fullName)) errs.fullName = 'Full name is required'
    if (!isValidPhone(form.phone)) errs.phone = 'Enter a valid 10-digit phone number'
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email address'
    if (form.age !== '' && (Number(form.age) <= 0 || Number(form.age) > 120)) errs.age = 'Age must be between 1 and 120'
    if (form.weight !== '' && Number(form.weight) <= 0) errs.weight = 'Weight must be a positive number'
    if (mode === 'add') {
      if (!form.subscriptionId) errs.subscriptionId = 'Select a plan'
      if (!form.startDate) errs.startDate = 'Pick a start date'
    }
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
      let memberId
      if (mode === 'edit') {
        const payload = { fullName: form.fullName, phone: form.phone, email: form.email }
        if (form.age !== '') payload.age = Number(form.age)
        if (form.weight !== '') payload.weight = Number(form.weight)
        payload.gender = form.gender
        await api.put(`/members/update/${member._id}`, payload)
        memberId = member._id
        toast.success('Member updated successfully')
      } else {
        const res = await api.post('/members/add', {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          age: form.age === '' ? undefined : Number(form.age),
          weight: form.weight === '' ? undefined : Number(form.weight),
          gender: form.gender,
          subscriptionId: form.subscriptionId,
          startDate: form.startDate,
        })
        memberId = res.data.data?.gymMember?._id
        toast.success('Member added successfully')
      }

      if (picFile && memberId) {
        const fd = new FormData()
        fd.append('profileImage', picFile)
        await api.put(`/members/profile-pic/${memberId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} title={mode === 'edit' ? 'Edit Member' : 'Add Member'} onClose={onClose} size="lg">
      {formError && <div className="mb-4"><Alert>{formError}</Alert></div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={fieldError(errors, 'fullName')}>
          <input
            value={form.fullName}
            onChange={set('fullName')}
            placeholder="e.g. Rahul Sharma"
            className={inputClass(!!errors.fullName)}
          />
        </Field>
        <Field label="Phone" required error={fieldError(errors, 'phone')}>
          <input
            value={form.phone}
            onChange={set('phone')}
            placeholder="10 digit number"
            inputMode="numeric"
            className={inputClass(!!errors.phone)}
          />
        </Field>
        <Field label="Email" required error={fieldError(errors, 'email')}>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            className={inputClass(!!errors.email)}
          />
        </Field>
        <Field label="Gender" hint="Optional">
          <select value={form.gender} onChange={set('gender')} className={inputClass(false)}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label="Age" hint="Optional" error={fieldError(errors, 'age')}>
          <input
            type="number"
            min="1"
            max="120"
            value={form.age}
            onChange={set('age')}
            placeholder="In years"
            className={inputClass(!!errors.age)}
          />
        </Field>
        <Field label="Weight (kg)" hint="Optional" error={fieldError(errors, 'weight')}>
          <input
            type="number"
            min="1"
            step="0.1"
            value={form.weight}
            onChange={set('weight')}
            placeholder="e.g. 72.5"
            className={inputClass(!!errors.weight)}
          />
        </Field>
        <Field label="Profile photo" hint="Optional" error={fieldError(errors, 'photo')}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-muted-foreground">
              {preview ? (
                <img src={preview} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFile}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-200"
              />
              <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG or WebP. Max 4 MB.</p>
            </div>
          </div>
        </Field>

        {mode === 'add' ? (
          <>
            <Field label="Subscription plan" required error={fieldError(errors, 'subscriptionId')}>
              <select value={form.subscriptionId} onChange={set('subscriptionId')} className={inputClass(!!errors.subscriptionId)}>
                <option value="">Select plan</option>
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.duration} - ₹{p.price})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Start date" required error={fieldError(errors, 'startDate')}>
              <input type="date" value={form.startDate} onChange={set('startDate')} className={inputClass(!!errors.startDate)} />
            </Field>
          </>
        ) : (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Membership plan and dates are managed from the <span className="font-semibold text-foreground">Renew</span> action.
          </p>
        )}

        {plansLoading && <p className="text-sm text-muted-foreground">Loading plans...</p>}
        {mode === 'add' && plansError && (
          <div className="sm:col-span-2"><Alert type="info">Could not load plans: {plansError}</Alert></div>
        )}

        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>
            {submitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Add member'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
