import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { fetchPublicSite, fetchPublicMemberships, fetchPublicContent, submitPublicLead } from '../services/publicSite'
import { getErrorMessage } from '../services/api'
import Spinner from '../components/Spinner'
import { inputClass } from '../components/ui'

const enabledOf = (website) => new Set(website?.enabledSections || [])

function Stars({ rating }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(rating)}
      <span className="text-surface-3">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function LeadForm({ slug }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Please enter your name')
      return
    }
    setError('')
    setStatus('sending')
    try {
      await submitPublicLead(slug, form)
      setStatus('done')
    } catch (err) {
      setError(getErrorMessage(err))
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-2xl border border-success-200 bg-success-50 p-6 text-center">
        <p className="text-lg font-bold text-success-700">Thank you! 🎉</p>
        <p className="mt-1 text-sm text-success-700">We&apos;ll get back to you shortly.</p>
      </div>
    )
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <input className={inputClass(false)} placeholder="Your name *" value={form.name} onChange={set('name')} />
      <input className={inputClass(false)} placeholder="Email" type="email" value={form.email} onChange={set('email')} />
      <input className={inputClass(false)} placeholder="Phone" value={form.phone} onChange={set('phone')} />
      <textarea rows={3} className={`${inputClass(false)} resize-y`} placeholder="I'm interested in..." value={form.message} onChange={set('message')} />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending...' : 'Get Started'}
      </button>
    </form>
  )
}

function Section({ title, children, className = '' }) {
  return (
    <section className={`mx-auto w-full max-w-6xl px-4 py-14 ${className}`}>
      <h2 className="mb-8 text-center text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h2>
      {children}
    </section>
  )
}

export default function GymSite() {
  const { slug } = useParams()

  const site = useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => fetchPublicSite(slug),
    retry: false,
  })
  const plans = useQuery({
    queryKey: ['public-plans', slug],
    queryFn: () => fetchPublicMemberships(slug),
    enabled: Boolean(slug),
  })
  const content = useQuery({
    queryKey: ['public-content', slug],
    queryFn: () => fetchPublicContent(slug),
    enabled: Boolean(slug),
  })

  if (site.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (site.isError || !site.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-2xl">🏋️</p>
        <h1 className="text-xl font-bold text-foreground">Gym not found</h1>
        <p className="text-sm text-muted-foreground">This gym hasn&apos;t published their site yet.</p>
      </div>
    )
  }

  const profile = site.data.profile
  const business = profile.business || {}
  const branding = profile.branding || {}
  const primary = branding.brandColors?.primary || '#6366f1'
  const gymName = business.gymName || business.legalName || 'Our Gym'
  const enabled = enabledOf(profile.website)
  const showAll = enabled.size === 0
  const show = (name) => showAll || enabled.has(name)

  const phone = profile.contact?.phones?.[0] || profile.contact?.whatsapp || ''
  const email = profile.contact?.email || ''
  const address = profile.location
    ? [profile.location.area, profile.location.city, profile.location.state].filter(Boolean).join(', ')
    : ''

  return (
    <div className="min-h-screen bg-surface text-foreground" style={{ ['--brand' ]: primary }}>
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-surface-3 bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2 text-lg font-extrabold">
            {branding.logo?.url ? (
              <img src={branding.logo.url} alt={gymName} className="h-9 w-9 rounded-full object-cover" />
            ) : null}
            {gymName}
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
            {show('Home') && <a href="#home" className="hover:text-foreground">Home</a>}
            {show('About') && <a href="#about" className="hover:text-foreground">About</a>}
            {show('Services') && <a href="#services" className="hover:text-foreground">Services</a>}
            {show('Trainers') && <a href="#trainers" className="hover:text-foreground">Trainers</a>}
            {show('Contact') && <a href="#contact" className="hover:text-foreground">Contact</a>}
          </nav>
          <a
            href="#contact"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: primary }}
          >
            Join now
          </a>
        </div>
      </header>

      {/* Hero */}
      {show('Home') && (
        <section id="home" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-600/15 via-transparent to-transparent" />
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                {profile.website?.hero?.headline || `${gymName} — where fitness meets results`}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {profile.website?.hero?.subheadline ||
                  (business.tagline || 'Join today and transform your body with expert trainers and modern equipment.')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#plans"
                  className="rounded-lg px-5 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: primary }}
                >
                  View membership plans
                </a>
                <a href="#contact" className="rounded-lg border border-surface-3 bg-surface px-5 py-3 text-sm font-bold text-foreground">
                  Book a free trial
                </a>
              </div>
            </div>
            {branding.logo?.url && (
              <div className="flex justify-center">
                <img src={branding.logo.url} alt={gymName} className="h-64 w-64 rounded-3xl object-cover shadow-card" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats strip */}
      {(show('Home') || show('About')) && (
        <div className="border-y border-surface-3 bg-surface-2">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4">
            <div>
              <p className="text-2xl font-black">{business.establishedYear || '—'}</p>
              <p className="text-xs text-muted-foreground">Established</p>
            </div>
            <div>
              <p className="text-2xl font-black">{profile.gymDetails?.categories?.length || 0}+</p>
              <p className="text-xs text-muted-foreground">Programs</p>
            </div>
            <div>
              <p className="text-2xl font-black">{profile.location?.city || '—'}</p>
              <p className="text-xs text-muted-foreground">Location</p>
            </div>
            <div>
              <p className="text-2xl font-black">{profile.hours?.openTime || '—'}–{profile.hours?.closeTime || '—'}</p>
              <p className="text-xs text-muted-foreground">Open hours</p>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      {show('About') && (
        <Section title="About us">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {profile.website?.about?.text ||
                (business.about ||
                  `${gymName} is dedicated to helping you achieve your fitness goals with premium equipment, expert coaching and a motivating community.`)}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(profile.gymDetails?.amenities || {})
                .filter(([, v]) => v)
                .map(([k]) => (
                  <div key={k} className="rounded-xl border border-surface-3 bg-surface-2 p-3 text-center text-sm capitalize">
                    {k.replace(/([A-Z])/g, ' $1')}
                  </div>
                ))}
            </div>
          </div>
        </Section>
      )}

      {/* Services */}
      {show('Services') && content.data?.services?.length > 0 && (
        <Section title="Services">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.data.services.map((s) => (
              <div key={s._id} className="rounded-2xl border border-surface-3 bg-surface-2 p-5">
                {s.image?.url && <img src={s.image.url} alt={s.name} className="mb-4 h-40 w-full rounded-xl object-cover" />}
                <h3 className="font-bold text-foreground">{s.name}</h3>
                {s.category && <p className="text-xs text-muted-foreground">{s.category}</p>}
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                <p className="mt-3 text-lg font-black" style={{ color: primary }}>
                  {s.price > 0 ? `₹${s.price}` : 'Free'}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Plans */}
      {plans.data?.plans?.length > 0 && (
        <Section id="plans" title="Membership plans" className="bg-surface-2">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.data.plans.map((p) => (
              <div key={p._id} className="rounded-2xl border border-surface-3 bg-surface p-6">
                <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                <p className="mt-2 text-3xl font-black" style={{ color: primary }}>
                  {p.grossPrice ? `₹${p.grossPrice}` : 'Free'}
                </p>
                <p className="text-sm text-muted-foreground">{p.duration || 'Monthly'}</p>
                <a
                  href="#contact"
                  className="mt-5 block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Enquire
                </a>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Trainers */}
      {show('Trainers') && content.data?.trainers?.length > 0 && (
        <Section title="Our trainers">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.data.trainers.map((t) => (
              <div key={t._id} className="rounded-2xl border border-surface-3 bg-surface-2 p-5 text-center">
                {t.image?.url ? (
                  <img src={t.image.url} alt={t.name} className="mx-auto mb-3 h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-2xl font-black text-brand-700">
                    {t.name?.charAt(0)}
                  </div>
                )}
                <h3 className="font-bold text-foreground">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.role}</p>
                {t.experienceYears > 0 && <p className="mt-1 text-xs text-muted-foreground">{t.experienceYears} yrs experience</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Testimonials */}
      {show('Testimonials') && content.data?.testimonials?.length > 0 && (
        <Section title="What members say">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.data.testimonials.map((t) => (
              <div key={t._id} className="rounded-2xl border border-surface-3 bg-surface-2 p-5">
                <Stars rating={t.rating} />
                <p className="mt-3 text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 text-sm font-bold text-foreground">{t.memberName}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Gallery */}
      {show('Gallery') && content.data?.gallery?.length > 0 && (
        <Section title="Gallery" className="bg-surface-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {content.data.gallery.flatMap((g) => g.media || []).map((m, i) => (
              <img key={i} src={m.url} alt="" className="h-40 w-full rounded-xl object-cover" />
            ))}
          </div>
        </Section>
      )}

      {/* Contact */}
      {show('Contact') && (
        <Section id="contact">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold text-foreground">Get in touch</h3>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                {phone && <p>📞 {phone}</p>}
                {email && <p>✉️ {email}</p>}
                {address && <p>📍 {address}</p>}
                <p>🕐 {profile.hours?.openTime || '—'} – {profile.hours?.closeTime || '—'}</p>
              </div>
              {profile.location?.latitude && profile.location?.longitude && (
                <iframe
                  title="map"
                  className="mt-5 h-56 w-full rounded-2xl border border-surface-3"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${profile.location.latitude},${profile.location.longitude}&z=14&output=embed`}
                />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Request a call back</h3>
              <div className="mt-4 rounded-2xl border border-surface-3 bg-surface-2 p-5">
                <LeadForm slug={slug} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Footer */}
      <footer className="border-t border-surface-3 bg-surface-2 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>{profile.website?.footer?.text || `© ${new Date().getFullYear()} ${gymName}. All rights reserved.`}</p>
        </div>
      </footer>
    </div>
  )
}
