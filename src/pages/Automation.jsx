import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  toggleAutomationRule,
  runAutomationRule,
  deleteAutomationRule,
} from '../services/automation'
import { getErrorMessage } from '../services/api'
import { useToast } from '../components/Toast'
import {
  Badge,
  Button,
  Card,
  DataGrid,
  Field,
  NativeSelect,
  PageHeader,
  inputClass,
} from '../components/ui'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatDate } from '../utils/format'

const TRIGGERS = [
  { value: 'member_created', label: 'Member created' },
  { value: 'membership_expiring', label: 'Membership expiring' },
  { value: 'lead_new', label: 'New lead' },
  { value: 'birthday', label: 'Member birthday' },
  { value: 'renewal_reminder', label: 'Renewal reminder' },
  { value: 'payment_overdue', label: 'Payment overdue' },
]

const ACTION_TYPES = ['whatsapp', 'email', 'sms', 'notification']
const TRIGGER_COLORS = {
  member_created: 'green',
  membership_expiring: 'amber',
  lead_new: 'blue',
  birthday: 'slate',
  renewal_reminder: 'green',
  payment_overdue: 'red',
}

const EMPTY_FORM = {
  name: '',
  trigger: 'membership_expiring',
  conditions: { daysBeforeExpiry: 7, membershipStatus: '', leadSource: '' },
  action: { type: 'whatsapp', template: '', subject: '', recipient: 'member' },
}

function RuleModal({ open, onClose, rule, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const editing = Boolean(rule)

  useEffect(() => {
    if (open) {
      setForm(rule ? JSON.parse(JSON.stringify(rule)) : JSON.parse(JSON.stringify(EMPTY_FORM)))
      setError('')
    }
  }, [open, rule])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setAction = (key, value) => setForm((f) => ({ ...f, action: { ...f.action, [key]: value } }))
  const setCondition = (key, value) => setForm((f) => ({ ...f, conditions: { ...f.conditions, [key]: value } }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Rule name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateAutomationRule(rule._id, form)
        toast.success('Rule updated')
      } else {
        await createAutomationRule(form)
        toast.success('Rule created')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const selectedTrigger = TRIGGERS.find((t) => t.value === form.trigger)?.label || form.trigger

  return (
    <Modal open={open} title={editing ? 'Edit automation rule' : 'New automation rule'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Field label="Rule name *">
          <input className={inputClass(false)} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Send renewal reminder 7 days before expiry" />
        </Field>
        <Field label="Trigger">
          <NativeSelect value={form.trigger} onChange={(e) => set('trigger', e.target.value)}>
            {TRIGGERS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </NativeSelect>
        </Field>

        {form.trigger === 'membership_expiring' || form.trigger === 'renewal_reminder' ? (
          <Field label="Days before expiry">
            <input
              type="number"
              className={inputClass(false)}
              value={form.conditions.daysBeforeExpiry ?? 7}
              onChange={(e) => setCondition('daysBeforeExpiry', Number(e.target.value))}
            />
          </Field>
        ) : null}
        {form.trigger === 'lead_new' && (
          <Field label="Lead source filter (optional)">
            <input className={inputClass(false)} value={form.conditions.leadSource || ''} onChange={(e) => setCondition('leadSource', e.target.value)} placeholder="website, walk-in..." />
          </Field>
        )}

        <Field label="Action type">
          <NativeSelect value={form.action.type} onChange={(e) => setAction('type', e.target.value)}>
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Message template" hint={`Variables: {{member}}, {{gym}}, {{plan}}, {{endDate}} — fires on "${selectedTrigger}"`}>
          <textarea
            rows={4}
            className={`${inputClass(false)} resize-y`}
            value={form.action.template || ''}
            onChange={(e) => setAction('template', e.target.value)}
            placeholder="Hi {{member}}, your {{plan}} membership at {{gym}} expires on {{endDate}}. Renew today!"
          />
        </Field>

        <div className="flex justify-end gap-3 border-t border-surface-3 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Save changes' : 'Create rule'}</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Automation() {
  const toast = useToast()
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [runResult, setRunResult] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['automation'],
    queryFn: () => getAutomationRules({}),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['automation'] })

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleAutomationRule(id),
    onSuccess: () => {
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const runMutation = useMutation({
    mutationFn: (id) => runAutomationRule(id),
    onSuccess: (res) => {
      setRunResult(res)
      toast.success('Dry run completed')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAutomationRule(deleteTarget._id),
    onSuccess: () => {
      toast.success('Rule deleted')
      setDeleteTarget(null)
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const items = data?.items || []

  const columns = [
    { header: 'Name', accessor: (r) => r.name, render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    {
      header: 'Trigger',
      accessor: (r) => r.trigger,
      render: (r) => (
        <Badge color={TRIGGER_COLORS[r.trigger] || 'slate'}>
          {TRIGGERS.find((t) => t.value === r.trigger)?.label || r.trigger}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessor: (r) => r.action.type,
      render: (r) => (
        <span className="text-sm capitalize text-muted-foreground">
          {r.action.type} → {r.action.recipient}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (r) => r.isActive,
      sortable: false,
      render: (r) => (
        <button
          type="button"
          onClick={() => toggleMutation.mutate(r._id)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            r.isActive
              ? 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400'
              : 'bg-surface-3 text-muted-foreground'
          }`}
        >
          {r.isActive ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      header: 'Runs',
      accessor: (r) => r.runCount || 0,
      render: (r) => (
        <span className="text-sm text-muted-foreground">
          {r.runCount || 0} run{r.runCount === 1 ? '' : 's'}
          {r.lastRunAt ? ` · ${formatDate(r.lastRunAt)}` : ''}
        </span>
      ),
    },
    {
      header: '',
      accessor: () => '',
      sortable: false,
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="outline" size="sm" onClick={() => runMutation.mutate(r._id)} loading={runMutation.isPending}>
            Test run
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setFormOpen(true) }}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(r)}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Automation"
        subtitle="Automate reminders and outreach to members and leads"
        action={<Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true) }}>New rule</Button>}
      />

      {runResult && (
        <Card className="p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Dry-run preview:</span> matched {runResult.matched} record(s), prepared {runResult.previewed} message(s). Nothing was actually sent.
          </p>
          <Button variant="ghost" size="sm" className="mt-1" onClick={() => setRunResult(null)}>Dismiss</Button>
        </Card>
      )}

      <DataGrid
        columns={columns}
        data={items}
        loading={isLoading && !items.length}
        error={error}
        rowKey={(r) => r._id}
        emptyState={{
          title: 'No automation rules',
          message: 'Create rules to automatically remind members about renewals and more.',
          icon: 'zap',
          action: <Button onClick={() => { setEditing(null); setFormOpen(true) }}>New rule</Button>,
        }}
      />

      <RuleModal open={formOpen} onClose={() => setFormOpen(false)} rule={editing} onSuccess={invalidate} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete rule"
        message={`Delete automation "${deleteTarget?.name}"?`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={deleteMutation.mutate}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
