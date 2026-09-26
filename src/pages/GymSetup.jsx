import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getGymSetup, saveSetupStep, completeSetup, uploadSetupImage, deleteSetupImage } from '../services/setup'
import { getErrorMessage } from '../services/api'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../components/Toast'
import {
  Button,
  Card,
  Field,
  NativeSelect,
  PageHeader,
  ProgressBar,
  inputClass,
} from '../components/ui'
import Spinner from '../components/Spinner'
import { STEP_FIELD_GROUPS, OPTIONAL_STEP_LABELS } from './gymSetupConfig'

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function setNested(obj, path, value) {
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
}

const clone = (v) => (v === undefined ? {} : JSON.parse(JSON.stringify(v)))

function FieldInput({ field, value, onChange }) {
  const base = inputClass(false)
  if (field.type === 'select') {
    return (
      <NativeSelect
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      >
        <option value="">Select...</option>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </NativeSelect>
    )
  }
  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 rounded border-surface-3 accent-brand-600"
        />
        {field.label}
      </label>
    )
  }
  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#6366f1'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-surface-3 bg-surface-2 p-1"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className={base}
        />
      </div>
    )
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={field.placeholder}
        className={`${base} resize-y`}
      />
    )
  }
  if (field.type === 'tags') {
    return <TagsInput values={Array.isArray(value) ? value : []} onChange={onChange} placeholder={field.placeholder} />
  }
  if (field.type === 'phoneList') {
    return <PhoneList values={Array.isArray(value) ? value : []} onChange={onChange} />
  }
  if (field.type === 'checkGroup') {
    return <CheckGroup field={field} value={value || {}} onChange={onChange} />
  }
  if (field.type === 'group') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {field.fields.map((sub) => (
          <Field key={sub.key} label={sub.label}>
            <FieldInput field={{ ...sub, type: 'text' }} value={getNested(value || {}, sub.key)} onChange={(v) => setNested(value || {}, sub.key, v)} />
          </Field>
        ))}
      </div>
    )
  }
  if (field.type === 'image') {
    return <ImageInput field={field} value={value || { url: '', publicId: '' }} onChange={onChange} />
  }
  return (
    <input
      type={field.type}
      value={value == null ? '' : value}
      onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  )
}

function TagsInput({ values, onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-brand-600 hover:text-brand-800 dark:text-brand-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={placeholder || 'Type and press Enter'}
          className={inputClass(false)}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  )
}

function PhoneList({ values, onChange }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v) onChange([...values, v])
    setDraft('')
  }
  return (
    <div>
      <div className="flex flex-col gap-1.5">
        {values.map((v, i) => (
          <div key={`${v}-${i}`} className="flex items-center gap-2">
            <span className="flex-1 rounded-lg border border-surface-3 bg-surface-2 px-3 py-2 text-sm">{v}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(values.filter((_, j) => j !== i))}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="+91 98765 43210"
          className={inputClass(false)}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  )
}

function CheckGroup({ field, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {field.options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-3 py-2 text-sm text-foreground transition hover:border-brand-400"
        >
          <input
            type="checkbox"
            checked={Boolean(value[opt])}
            onChange={(e) => onChange({ ...value, [opt]: e.target.checked })}
            className="size-4 accent-brand-600"
          />
          <span className="capitalize">{opt.replace(/([A-Z])/g, ' $1').trim()}</span>
        </label>
      ))}
    </div>
  )
}

function ImageInput({ field, value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const res = await uploadSetupImage(file, field.folder)
      if (value.publicId) deleteSetupImage(value.publicId).catch(() => {})
      onChange(res)
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-danger-600">{error}</p>}
      <div className="flex items-center gap-4">
        {value.url ? (
          <img src={value.url} alt="" className="h-16 w-16 rounded-xl border border-surface-3 object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-surface-3 text-xs text-muted-foreground">
            No image
          </div>
        )}
        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <span className="inline-flex items-center gap-2 rounded-lg border border-surface-3 bg-surface-2 px-3 py-2 text-sm font-medium text-foreground transition hover:border-brand-400">
            {uploading ? 'Uploading...' : 'Upload image'}
          </span>
        </label>
      </div>
    </div>
  )
}

function ObjectList({ field, value, onChange }) {
  const list = Array.isArray(value) ? value : []
  const updateItem = (index, key, v) => {
    const next = [...list]
    next[index] = { ...next[index], [key]: v }
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-3">
      {list.map((item, i) => (
        <div key={i} className="rounded-xl border border-surface-3 bg-surface-2 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item {i + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(list.filter((_, j) => j !== i))}>
              Remove
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field.subfields.map((sub) => (
              <Field key={sub.key} label={sub.label}>
                <FieldInput field={sub} value={item?.[sub.key]} onChange={(v) => updateItem(i, sub.key, v)} />
              </Field>
            ))}
          </div>
        </div>
      ))}
      <div>
        <Button type="button" variant="outline" onClick={() => onChange([...list, {}])}>
          + Add {field.label === 'Branches' || field.label === 'Staff roles' ? 'item' : 'item'}
        </Button>
      </div>
    </div>
  )
}

function StepForm({ stepKey, initial, onSaved }) {
  const [data, setData] = useState(() => clone(initial))
  const { setTheme } = useTheme()

  // Live preview for theme customization
  useEffect(() => {
    if (stepKey === 'customization' && data?.customization?.themePreset) {
      setTheme(data.customization.themePreset)
    }
  }, [stepKey, data?.customization?.themePreset, setTheme])

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const fields = STEP_FIELD_GROUPS[stepKey] || []

  useEffect(() => {
    setData(clone(initial))
  }, [stepKey, initial])

  const set = (key) => (value) => setData((prev) => {
    const next = { ...prev }
    setNested(next, key, value)
    return next
  })

  const handleSave = async () => {
    const errs = {}
    for (const f of fields) {
      if (f.required) {
        const v = getNested(data, f.key)
        const empty = Array.isArray(v) ? v.length === 0 : !v || (typeof v === 'string' && !v.trim())
        if (empty) errs[f.key] = `${f.label} is required`
      }
    }
    setErrors(errs)
    if (Object.keys(errs).length) {
      onSaved?.({ ok: false, reason: 'validation' })
      return
    }
    setSaving(true)
    try {
      const payload =
        stepKey === 'branches' || stepKey === 'documents'
          ? data[stepKey] || []
          : { ...data }
      await saveSetupStep(stepKey, payload)
      onSaved?.({ ok: true })
    } catch (err) {
      onSaved?.({ ok: false, error: getErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSave()
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' || field.type === 'tags' || field.type === 'phoneList' || field.type === 'checkGroup' || field.type === 'group' || field.type === 'image' || field.type === 'objectList' ? 'sm:col-span-2' : ''}>
            {field.type === 'checkbox' ? (
              <FieldInput field={field} value={getNested(data, field.key)} onChange={set(field.key)} />
            ) : (
              <Field label={field.label} error={errors[field.key]} hint={field.help}>
                {field.type === 'objectList' ? (
                  <ObjectList field={field} value={getNested(data, field.key)} onChange={set(field.key)} />
                ) : (
                  <FieldInput field={field} value={getNested(data, field.key)} onChange={set(field.key)} />
                )}
              </Field>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 border-t border-surface-3 pt-4">
        <Button type="submit" loading={saving}>
          Save step
        </Button>
      </div>
    </form>
  )
}

export default function GymSetup() {
  const toast = useToast()
  const qc = useQueryClient()
  const [activeIndex, setActiveIndex] = useState(0)
  const [completing, setCompleting] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['gym-setup'],
    queryFn: getGymSetup,
  })

  const steps = data?.steps || []
  const profile = data?.profile || {}
  const completion = data?.completion || { completionPercent: 0, completedSections: [], setupComplete: false }

  const completedSet = useMemo(() => new Set(completion.completedSections || []), [completion.completedSections])

  const handleSaved = ({ ok, error: saveError }) => {
    if (ok) {
      qc.invalidateQueries({ queryKey: ['gym-setup'] })
      toast.success(`${steps[activeIndex]?.label} saved`)
    } else if (saveError) {
      toast.error(saveError)
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeSetup()
      qc.invalidateQueries({ queryKey: ['gym-setup'] })
      toast.success('Setup completed! Your gym is ready.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCompleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <PageHeader
        title="Gym Setup"
        subtitle={`Something went wrong loading your setup. ${error?.message || String(error)}`}
      />
    )
  }

  const current = steps[activeIndex]
  const isOptional = current && OPTIONAL_STEP_LABELS.has(current.key)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gym Setup" subtitle="Configure your gym — most steps are optional and skippable" />

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">Setup progress</span>
            {completion.setupComplete && (
              <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-500/15 dark:text-success-400">
                Complete
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-muted-foreground">{completion.completionPercent || 0}%</span>
        </div>
        <ProgressBar value={completion.completionPercent || 0} className="mt-3" barClassName="bg-brand-gradient" />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="self-start p-2">
          <ol className="flex flex-col gap-0.5">
            {steps.map((step, i) => {
              const done = completedSet.has(step.key)
              const active = i === activeIndex
              return (
                <li key={step.key}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? 'bg-brand-600 text-white'
                        : 'text-foreground hover:bg-surface-2'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : done
                            ? 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400'
                            : 'bg-surface-3 text-muted-foreground'
                      }`}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="flex-1 truncate">{step.label}</span>
                    {OPTIONAL_STEP_LABELS.has(step.key) && (
                      <span className={`text-[10px] uppercase tracking-wide ${active ? 'text-white/70' : 'text-muted-foreground'}`}>
                        optional
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
        </Card>

        <Card className="p-5">
          {current ? (
            <>
              <div className="mb-5 flex items-center justify-between border-b border-surface-3 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">{current.label}</h3>
                  {isOptional && (
                    <p className="text-xs text-muted-foreground">Optional — you can skip this step.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    disabled={activeIndex === 0}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveIndex((i) => Math.min(steps.length - 1, i + 1))}
                    disabled={activeIndex === steps.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <StepForm
                stepKey={current.key}
                initial={
                  current.key === 'branches' || current.key === 'documents'
                    ? { [current.key]: profile[current.key] || [] }
                    : profile[current.key]
                }
                onSaved={handleSaved}
              />
            </>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">No steps available.</div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h4 className="text-sm font-bold text-foreground">Finish setup</h4>
            <p className="text-sm text-muted-foreground">
              {completion.setupComplete
                ? 'Setup is complete. You can continue editing anytime.'
                : `Required steps remaining: ${(steps || []).filter((s) => !OPTIONAL_STEP_LABELS.has(s.key) && !completedSet.has(s.key)).map((s) => s.label).join(', ') || 'none'}`}
            </p>
          </div>
          <Button onClick={handleComplete} loading={completing} disabled={!completion.setupComplete}>
            Mark setup complete
          </Button>
        </div>
      </Card>
    </div>
  )
}
