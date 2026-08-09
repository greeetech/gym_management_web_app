import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getGymSetup, saveSetupStep, toggleSetupPublish } from '../services/setup'
import { publicQrUrl } from '../services/publicSite'
import { getErrorMessage } from '../services/api'
import { useToast } from '../components/Toast'
import { Button, Card, Field, PageHeader, inputClass } from '../components/ui'
import Spinner from '../components/Spinner'

function setNested(obj, path, value) {
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
}

const SECTION_OPTIONS = ['Home', 'About', 'Services', 'Trainers', 'Gallery', 'Testimonials', 'Contact']

export default function WebsiteBuilder() {
  const toast = useToast()
  const qc = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['gym-setup'],
    queryFn: getGymSetup,
  })

  const [form, setForm] = useState(null)

  useEffect(() => {
    if (data?.profile) {
      setForm(JSON.parse(JSON.stringify(data.profile.website || {})))
    }
  }, [data])

  const current = form || {}
  const published = data?.profile?.isDraft === false

  const set = (key) => (e) => {
    setForm((prev) => {
      const next = { ...prev }
      setNested(next, key, e.target.value)
      return next
    })
    setError('')
  }

  const toggleSection = (name) => {
    setForm((prev) => {
      const list = prev?.enabledSections || []
      return { ...prev, enabledSections: list.includes(name) ? list.filter((s) => s !== name) : [...list, name] }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await saveSetupStep('website', current)
      qc.invalidateQueries({ queryKey: ['gym-setup'] })
      toast.success('Website settings saved')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (publish) => {
    setPublishing(true)
    setError('')
    try {
      await saveSetupStep('website', current)
      await toggleSetupPublish(publish)
      qc.invalidateQueries({ queryKey: ['gym-setup'] })
      toast.success(publish ? 'Website published!' : 'Website unpublished')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const slug = current.slug || ''
  const previewUrl = slug ? `/g/${slug}` : ''

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Website Builder" subtitle="Build and publish your gym's public website" />

      {error && <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Public URL</h3>
            <p className="text-xs text-muted-foreground">
              {slug ? `Your site will live at ${window.location.origin}/g/${slug}` : 'Save a slug to publish your site.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                published
                  ? 'bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400'
                  : 'bg-surface-3 text-muted-foreground'
              }`}
            >
              {published ? 'Published' : 'Draft'}
            </span>
            {previewUrl && (
              <Link to={previewUrl} target="_blank" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500">
                View site
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant={published ? 'outline' : 'secondary'}
            loading={publishing}
            onClick={() => handlePublish(!published)}
            disabled={!slug}
          >
            {published ? 'Unpublish site' : 'Publish site'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {published
              ? 'Your site is live for anyone with the link.'
              : 'Saving a slug above, then publishing makes your public site live.'}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Field label="Slug" hint="Lowercase letters, numbers and dashes">
              <input className={inputClass(false)} value={current.slug || ''} onChange={set('slug')} placeholder="my-gym-name" />
            </Field>

            <div>
              <span className="mb-2 block text-sm font-medium text-foreground">Enabled sections</span>
              <div className="flex flex-wrap gap-2">
                {SECTION_OPTIONS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleSection(name)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      (current.enabledSections || []).includes(name)
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-2 text-muted-foreground hover:bg-surface-3'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Hero headline">
              <input className={inputClass(false)} value={current.hero?.headline || ''} onChange={set('hero.headline')} />
            </Field>
            <Field label="Hero subheadline">
              <input className={inputClass(false)} value={current.hero?.subheadline || ''} onChange={set('hero.subheadline')} />
            </Field>
            <Field label="About text">
              <textarea rows={3} className={`${inputClass(false)} resize-y`} value={current.about?.text || ''} onChange={set('about.text')} />
            </Field>
            <Field label="Footer text">
              <input className={inputClass(false)} value={current.footer?.text || ''} onChange={set('footer.text')} />
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="SEO title">
              <input className={inputClass(false)} value={current.seo?.title || ''} onChange={set('seo.title')} />
            </Field>
            <Field label="SEO description">
              <textarea rows={2} className={`${inputClass(false)} resize-y`} value={current.seo?.description || ''} onChange={set('seo.description')} />
            </Field>
            <Field label="SEO keywords" hint="Comma separated">
              <input className={inputClass(false)} value={(current.seo?.keywords || []).join(', ')} onChange={(e) => {
                const keywords = e.target.value.split(',').map((k) => k.trim()).filter(Boolean)
                setForm((prev) => ({ ...prev, seo: { ...prev.seo, keywords } }))
              }} />
            </Field>

            {slug && (
              <div className="rounded-xl border border-surface-3 bg-surface-2 p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">QR code</p>
                <img src={publicQrUrl(slug)} alt={`QR for /g/${slug}`} className="h-32 w-32 rounded-lg border border-surface-3 bg-white" />
                <p className="mt-2 text-xs text-muted-foreground">Scan to open your public site.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-surface-3 pt-4">
          <Button onClick={handleSave} loading={saving}>
            Save website settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
