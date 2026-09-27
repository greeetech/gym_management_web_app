import { Link } from 'react-router-dom'
import { PageHeader, Card, Button } from '../components/ui'
import { Icon } from '../components/icons'

const FEATURES = [
  {
    icon: 'layout-dashboard',
    title: 'Real-Time Gym Analytics',
    desc: 'Monitor active members, expiring subscriptions, revenue trends, and growth metrics from a unified high-speed dashboard.'
  },
  {
    icon: 'file',
    title: 'Zero-Cloudinary In-Memory Invoicing',
    desc: 'Cost-effective, pixel-perfect PDF receipts generated on-the-fly. Zero third-party file storage fees with instant PDF downloads and printing.'
  },
  {
    icon: 'qrcode',
    title: 'WhatsApp Multi-Device Gateway',
    desc: 'Scan your gym phone once to automatically transmit official PDF invoice documents directly into member WhatsApp chats on enrollment and renewal.'
  },
  {
    icon: 'users',
    title: '360° Member & Plan Management',
    desc: 'Track attendance, goals, renewals, discounts, and payment modes with 1-click renewal drawers and automated expiry alerts.'
  },
  {
    icon: 'credit-card',
    title: 'Integrated Razorpay Billing',
    desc: 'Seamless SaaS subscription management for gym owners with automated webhook processing, instant plan upgrades, and invoice records.'
  },
  {
    icon: 'sparkles',
    title: 'Progressive Web App (PWA)',
    desc: 'Install Gym Manager on desktop, iOS, or Android with zero app store hassle. Full offline support, fast caching, and desktop notifications.'
  }
]

export default function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <PageHeader
        title="About Gym Manager"
        subtitle="Empowering fitness centers with intelligent, high-speed gym management software"
        breadcrumb="Company"
        icon="info"
      />

      {/* Hero Card */}
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 size-56 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-white/10">
            <Icon name="dumbbell" className="size-3.5" />
            Product Version 1.0 • Pre-Production Ready
          </div>
          <h2 className="text-2xl font-extrabold sm:text-3xl tracking-tight">
            Built for Modern Gym Owners & Fitness Centers
          </h2>
          <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong>Gym Manager</strong> was engineered from the ground up to eliminate the daily friction of gym operations. From automated WhatsApp receipt delivery and expiry reminders to lead nurturing and transparent revenue tracking, Gym Manager provides gym owners with a single, lightning-fast operating system.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/guide">
              <Button size="sm">
                <Icon name="book-open" className="size-3.5" />
                Explore Step-by-Step Guide
              </Button>
            </Link>
            <Link to="/privacy-policy">
              <Button variant="secondary" size="sm">
                Privacy & Data Security
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Features Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">Core Architecture & Capabilities</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, idx) => (
            <Card key={idx} className="p-5 border-border-subtle bg-surface hover:shadow-card transition flex flex-col justify-between">
              <div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
                  <Icon name={feat.icon} className="size-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">{feat.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Stack & Standards */}
      <Card className="p-6 border-border bg-surface shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-foreground">Enterprise-Grade Technology Stack</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Powered by React 19, Vite, Tailwind CSS, Node.js, Express, MongoDB, Redis, and Baileys Multi-Device WhatsApp Engine. Engineered for sub-100ms API response times, instant PDF rendering, and zero-downtime reliability.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {['React 19', 'Vite 8', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB Atlas', 'Redis', 'PDFKit', 'Baileys Multi-Device', 'PWA'].map((t) => (
            <span key={t} className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-mono font-medium text-foreground">
              {t}
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}
