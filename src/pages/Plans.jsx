import { useState } from 'react'
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/useQueries'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { Alert, Button, EmptyState, Field, PageHeader, NativeSelect, inputClass } from '../components/ui'
import { Icon } from '../components/icons'
import { formatINR } from '../utils/format'

const DURATIONS = ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly']
const EMPTY_FORM = { name: '', grossPrice: '', price: '', duration: 'Monthly' }

const DURATION_META = {
  Monthly: { short: '1 mo', color: 'from-brand-500 to-brand-700' },
  Quarterly: { short: '3 mo', color: 'from-indigo-500 to-violet-700' },
  'Half Yearly': { short: '6 mo', color: 'from-violet-500 to-purple-700' },
  Yearly: { short: '12 mo', color: 'from-purple-500 to-fuchsia-700' },
}

export default function Plans() {
  const { data: plans = [], isLoading, error } = usePlans()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (plan) => {
    setEditing(plan)
    setForm({
      name: plan.name,
      grossPrice: plan.grossPrice,
      price: plan.price,
      duration: plan.duration,
    })
    setErrors({})
    setFormError('')
    setModalOpen(true)
  }

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Plan name is required'
    const gross = Number(form.grossPrice)
    const price = Number(form.price)
    if (!form.grossPrice || Number.isNaN(gross) || gross <= 0) errs.grossPrice = 'Enter a valid gross price'
    if (!form.price || Number.isNaN(price) || price <= 0) errs.price = 'Enter a valid selling price'
    if (form.grossPrice && form.price && gross > 0 && price > 0 && price > gross) {
      errs.price = 'Selling price cannot exceed gross price'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setFormError('')
    const payload = {
      name: form.name.trim(),
      grossPrice: Number(form.grossPrice),
      price: Number(form.price),
      duration: form.duration,
    }
    try {
      if (editing) {
        await updatePlan.mutateAsync({ id: editing._id, payload })
      } else {
        await createPlan.mutateAsync(payload)
      }
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message || 'Failed to save plan')
    }
  }

  const handleDelete = () => {
    deletePlan.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const discount = (p) =>
    p.grossPrice > p.price ? Math.round(((p.grossPrice - p.price) / p.grossPrice) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        subtitle="Create and manage the plans your members subscribe to"
        breadcrumb="Management"
        action={
          <Button onClick={openAdd}>
            <Icon name="plus" className="size-4" />
            Add Plan
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert>{error.message}</Alert>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-surface-2" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <EmptyState
            title="No plans yet"
            message="Create your first subscription plan so members can join."
            action={<Button onClick={openAdd}>Create a plan</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => {
            const meta = DURATION_META[p.duration] || DURATION_META.Monthly
            const off = discount(p)
            return (
              <div
                key={p._id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition hover:-translate-y-1 hover:shadow-elevated"
              >
                <div className={`bg-gradient-to-r px-6 pb-5 pt-6 ${meta.color}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">{p.name}</h3>
                      <p className="mt-0.5 text-sm text-white/70">{meta.short} subscription</p>
                    </div>
                    {off > 0 && (
                      <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                        {off}% off
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-end gap-2 text-white">
                    <span className="text-3xl font-extrabold tracking-tight">{formatINR(p.price)}</span>
                    {p.grossPrice > p.price && (
                      <span className="mb-1 text-sm text-white/60 line-through">{formatINR(p.grossPrice)}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <ul className="flex-1 space-y-2.5">
                    {[
                      { label: `${meta.short} access`, icon: 'check' },
                      { label: 'Renewals & status tracking', icon: 'refresh' },
                      { label: 'Works across your gym', icon: 'shield' },
                    ].map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-600">
                          <Icon name={f.icon} className="size-3" />
                        </span>
                        {f.label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex gap-2 border-t border-border-subtle pt-5">
                    <Button variant="secondary" className="flex-1" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => setDeleteTarget(p)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Edit Plan' : 'Add Plan'}
        onClose={() => setModalOpen(false)}
        size="md"
      >
        {formError && (
          <div className="mb-4">
            <Alert>{formError}</Alert>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Plan name" required error={errors.name}>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Silver Membership"
              className={inputClass(!!errors.name)}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Gross price (₹)" required error={errors.grossPrice}>
              <input
                type="number"
                min="1"
                value={form.grossPrice}
                onChange={set('grossPrice')}
                className={inputClass(!!errors.grossPrice)}
              />
            </Field>
            <Field label="Price (₹)" required error={errors.price}>
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={set('price')}
                className={inputClass(!!errors.price)}
              />
            </Field>
          </div>
          <Field label="Duration" hint="Optional — defaults to Monthly">
            <NativeSelect value={form.duration} onChange={set('duration')}>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <p className="text-xs text-muted-foreground">Gross price should be greater than the selling price.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createPlan.isPending || updatePlan.isPending}>
              {createPlan.isPending || updatePlan.isPending
                ? 'Saving...'
                : editing
                  ? 'Save changes'
                  : 'Add plan'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete plan"
        message={`Are you sure you want to delete the "${deleteTarget?.name}" plan?`}
        confirmText="Delete"
        loading={deletePlan.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
