import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLeads, createLead, updateLead, updateLeadStatus, addLeadNote, convertLead, deleteLead } from '../services/leads'
import { usePlans } from '../hooks/useQueries'
import { getErrorMessage } from '../services/api'
import { useToast } from '../components/Toast'
import {
  Badge,
  Button,
  DataGrid,
  Field,
  NativeSelect,
  PageHeader,
  SearchInput,
  inputClass,
} from '../components/ui'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatDate } from '../utils/format'
import { isValidEmail } from '../utils/validation'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']
const STATUS_COLORS = { New: 'blue', Contacted: 'amber', Qualified: 'green', Converted: 'green', Lost: 'red' }

const EMPTY_FORM = { name: '', email: '', phone: '', source: '', message: '', interest: '' }

function LeadModal({ open, onClose, lead, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const editing = Boolean(lead)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setError('')
  }

  useEffect(() => {
    if (open) {
      setForm(lead ? { ...EMPTY_FORM, ...lead } : EMPTY_FORM)
      setError('')
    }
  }, [open, lead])

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    if (form.email && !isValidEmail(form.email)) {
      setError('Enter a valid email')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await updateLead(lead._id, form)
        toast.success('Lead updated')
      } else {
        await createLead(form)
        toast.success('Lead created')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={editing ? 'Edit lead' : 'Add lead'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Field label="Name *">
          <input className={inputClass(false)} value={form.name} onChange={set('name')} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input className={inputClass(false)} value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Phone">
            <input className={inputClass(false)} value={form.phone} onChange={set('phone')} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Source">
            <input className={inputClass(false)} value={form.source} onChange={set('source')} placeholder="Website, walk-in, referral..." />
          </Field>
          <Field label="Interest">
            <input className={inputClass(false)} value={form.interest} onChange={set('interest')} placeholder="Monthly plan, PT..." />
          </Field>
        </div>
        <Field label="Message">
          <textarea rows={3} className={`${inputClass(false)} resize-y`} value={form.message} onChange={set('message')} />
        </Field>
        <div className="flex justify-end gap-3 border-t border-surface-3 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editing ? 'Save changes' : 'Add lead'}</Button>
        </div>
      </div>
    </Modal>
  )
}

function ConvertModal({ lead, plans, onClose, onSuccess }) {
  const toast = useToast()
  const [subscriptionId, setSubscriptionId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleConvert = async () => {
    if (!subscriptionId) {
      setError('Select a plan')
      return
    }
    setSaving(true)
    setError('')
    try {
      await convertLead(lead._id, { subscriptionId, startDate })
      toast.success(`${lead.name} converted to member!`)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open title={`Convert ${lead.name} to member`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Field label="Membership plan">
          <NativeSelect value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)}>
            <option value="">Select a plan...</option>
            {(plans || []).map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — ₹{p.price || 0}/{p.duration}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Start date">
          <input type="date" className={inputClass(false)} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-3 border-t border-surface-3 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConvert} loading={saving}>Convert to member</Button>
        </div>
      </div>
    </Modal>
  )
}

function NotesModal({ lead, onClose }) {
  const toast = useToast()
  const qc = useQueryClient()
  const [text, setText] = useState('')

  const noteMutation = useMutation({
    mutationFn: (body) => addLeadNote(lead._id, body),
    onSuccess: () => {
      toast.success('Note added')
      setText('')
      qc.invalidateQueries({ queryKey: ['leads'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <Modal open title={`Notes — ${lead.name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {(lead.notes || []).slice().reverse().map((n, i) => (
            <div key={i} className="rounded-xl border border-surface-3 bg-surface-2 p-3">
              <p className="text-sm text-foreground">{n.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {n.by} · {formatDate(n.at)}
              </p>
            </div>
          ))}
          {(lead.notes || []).length === 0 && (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          )}
        </div>
        <div className="flex gap-2 border-t border-surface-3 pt-4">
          <input
            className={inputClass(false)}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a note..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) noteMutation.mutate(text.trim())
            }}
          />
          <Button onClick={() => text.trim() && noteMutation.mutate(text.trim())} loading={noteMutation.isPending}>Add</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Leads() {
  const toast = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [convertTarget, setConvertTarget] = useState(null)
  const [notesTarget, setNotesTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const queryParams = useMemo(
    () => ({ page, q: search || undefined, status: status === 'All' ? undefined : status }),
    [page, search, status],
  )

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['leads', queryParams],
    queryFn: () => getLeads(queryParams),
  })

  const { data: plans = [] } = usePlans()

  const invalidate = () => qc.invalidateQueries({ queryKey: ['leads'] })

  const statusMutation = useMutation({
    mutationFn: ({ id, value }) => updateLeadStatus(id, value),
    onSuccess: () => {
      toast.success('Status updated')
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteLead(deleteTarget._id),
    onSuccess: () => {
      toast.success('Lead deleted')
      setDeleteTarget(null)
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const items = data?.items || []
  const statusCounts = data?.statusCounts || []
  const total = data?.total || 0
  const limit = data?.limit || 10
  const totalPages = data?.totalPages || 1

  const columns = [
    {
      header: 'Lead',
      accessor: (l) => l.name,
      sortable: false,
      render: (l) => (
        <div>
          <p className="font-medium text-foreground">{l.name}</p>
          <p className="text-xs text-muted-foreground">
            {l.email || l.phone || '—'}
          </p>
        </div>
      ),
    },
    { header: 'Source', accessor: (l) => l.source, render: (l) => <span className="text-sm text-muted-foreground">{l.source || '—'}</span> },
    { header: 'Interest', accessor: (l) => l.interest, render: (l) => <span className="text-sm text-muted-foreground">{l.interest || '—'}</span> },
    {
      header: 'Status',
      accessor: (l) => l.status,
      sortable: false,
      render: (l) => (
        <NativeSelect
          value={l.status}
          onChange={(e) => statusMutation.mutate({ id: l._id, value: e.target.value })}
          className="w-36"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </NativeSelect>
      ),
    },
    { header: 'Date', accessor: (l) => l.createdAt, render: (l) => <span className="text-sm text-muted-foreground">{formatDate(l.createdAt)}</span> },
    {
      header: '',
      accessor: () => '',
      sortable: false,
      render: (l) => (
        <div className="flex justify-end gap-1">
          {l.status !== 'Converted' && (
            <Button variant="outline" size="sm" onClick={() => setConvertTarget(l)}>Convert</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setNotesTarget(l)}>Notes</Button>
          <Button variant="ghost" size="sm" onClick={() => { setEditing(l); setFormOpen(true) }}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(l)}>Delete</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Leads" subtitle="Capture, nurture and convert leads into members" action={
        <Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true) }}>Add lead</Button>
      } />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name, email or phone..." />
        <NativeSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="w-40">
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </NativeSelect>
        <div className="flex flex-wrap gap-2">
          {statusCounts.map(({ status: s, count }) => (
            <Badge key={s} color={STATUS_COLORS[s] || 'slate'} className="text-xs">
              {s}: {count}
            </Badge>
          ))}
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={items}
        loading={isLoading && !items.length}
        error={error}
        rowKey={(l) => l._id}
        pagination={{ page, limit, total, totalPages }}
        onPageChange={setPage}
        className={isFetching && items.length ? 'opacity-80 transition-opacity' : undefined}
        emptyState={{ title: 'No leads found', message: 'Try a different filter or add your first lead.', icon: 'users' }}
      />

      <LeadModal open={formOpen} onClose={() => setFormOpen(false)} lead={editing} onSuccess={invalidate} />

      {convertTarget && (
        <ConvertModal
          lead={convertTarget}
          plans={plans}
          onClose={() => setConvertTarget(null)}
          onSuccess={invalidate}
        />
      )}

      {notesTarget && <NotesModal lead={notesTarget} onClose={() => setNotesTarget(null)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete lead"
        message={`Delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={deleteMutation.mutate}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
