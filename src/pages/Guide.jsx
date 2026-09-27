import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Card, Button, Badge } from '../components/ui'
import { Icon } from '../components/icons'

const TIPS = [
  {
    icon: 'sparkles',
    title: 'Install as Native App (PWA)',
    desc: 'You can install Gym Manager on Windows, Mac, Android, and iOS for 1-click access and offline capability. Click "Install App" in the sidebar.'
  },
  {
    icon: 'search',
    title: 'Quick Command Palette (⌘K / Ctrl+K)',
    desc: 'Press Ctrl+K (or ⌘K) from anywhere to instantly search members, jump to invoices, or navigate between sections in milliseconds.'
  },
  {
    icon: 'message-circle',
    title: 'WhatsApp Multi-Device Gateway',
    desc: 'Scan your gym phone once via QR code in Settings or Member Profile to transmit real PDF invoices directly to members automatically.'
  },
  {
    icon: 'refresh',
    title: '1-Click Renewals & Expiry Alerts',
    desc: 'Filter members expiring in 3, 7, or 15 days in the Memberships tab. Hit Renew to immediately update validity and issue fresh receipts.'
  }
]

const STEPS = [
  {
    step: '01',
    title: 'Complete Your Gym Setup & Branding',
    badge: 'Initial Setup',
    icon: 'settings',
    to: '/setup',
    actionText: 'Go to Gym Setup',
    summary: 'Personalize your gym credentials so all invoices, landing pages, and receipts show your official business identity.',
    points: [
      'Enter Gym Name, Legal Name, and Business Phone/Email in Settings & Setup.',
      'Upload your official gym Logo (appears on all branded PDF receipts).',
      'Add your physical gym address, city, state, and pin code.',
      'Provide GSTIN / PAN if applicable, and configure your Custom Invoice Prefix (e.g., IRON-2026).'
    ]
  },
  {
    step: '02',
    title: 'Create Membership Plans & Pricing',
    badge: 'Pricing & Plans',
    icon: 'list',
    to: '/plans',
    actionText: 'Create Plans',
    summary: 'Define the subscription packages you sell to gym members (Monthly, Quarterly, Half-Yearly, Annual).',
    points: [
      'Click "+ New Plan" in the Subscription Plans tab.',
      'Enter Plan Name (e.g., "Strength & Cardio Platinum").',
      'Set Duration (e.g., 1 Month, 3 Months, 12 Months).',
      'Set Base/Gross Price and Final Selling Price (automatic discount calculation will appear on receipts).'
    ]
  },
  {
    step: '03',
    title: 'Link WhatsApp Multi-Device Gateway (QR Scan)',
    badge: 'Automated Invoices',
    icon: 'qrcode',
    to: '/settings',
    actionText: 'Link WhatsApp',
    summary: 'Link your WhatsApp once so our server delivers real PDF document files directly from your gym number with zero Cloudinary dependency.',
    points: [
      'Open Settings or Member Invoices and click "Link WhatsApp (QR Code)".',
      'Click "Generate WhatsApp QR Code".',
      'Open WhatsApp on your phone -> Settings -> Linked Devices -> Link a Device.',
      'Scan the QR code on screen. Once linked, the green badge appears and all invoices are auto-dispatched!'
    ]
  },
  {
    step: '04',
    title: 'Onboard Members & Issue Instant PDF Receipts',
    badge: 'Daily Operations',
    icon: 'users',
    to: '/members',
    actionText: 'Manage Members',
    summary: 'Add members, capture their fitness goals, assign plans, and immediately provide branded receipts.',
    points: [
      'Click "+ Add Member" in the Members tab.',
      'Enter Full Name, Phone (+91), Gender, and select their Membership Plan.',
      'Gym Manager automatically creates the member, assigns the membership, and generates Invoice #1 in the background.',
      'Click [Preview] to print A4/thermal receipt, [Download PDF], or [Send PDF] to deliver directly on WhatsApp.'
    ]
  },
  {
    step: '05',
    title: 'Track Expiries & Process 1-Click Renewals',
    badge: 'Revenue Retention',
    icon: 'shield',
    to: '/memberships',
    actionText: 'View Memberships',
    summary: 'Never lose a member due to missed follow-ups. Automated expiry filters highlight upcoming renewals.',
    points: [
      'Use the Expiry Filter (e.g., "Expires in 7 days" or "Expired") in Memberships.',
      'Send automated renewal reminder messages on WhatsApp in 1 click.',
      'When the member pays, click "Renew / New Membership" on their profile to extend validity and issue receipt #2 without duplicate history clutter.'
    ]
  },
  {
    step: '06',
    title: 'Capture Inbound Leads via Public Gym Micro-site',
    badge: 'Lead Generation',
    icon: 'eye',
    to: '/leads',
    actionText: 'View Leads',
    summary: 'Every gym gets a dedicated public landing page (/g/:slug) with membership pricing and inquiry forms.',
    points: [
      'Share your public gym link on Instagram, WhatsApp bio, or Google Maps.',
      'Visitors can view your facility photos, trainer details, and submit trial requests.',
      'All inquiries automatically appear in your "Leads" tab with 1-click WhatsApp follow-up and conversion to active member.'
    ]
  }
]

export default function Guide() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <PageHeader
        title="How to Use Gym Manager"
        subtitle="Complete step-by-step master guide & pro onboarding tips"
        breadcrumb="Resources"
        icon="book-open"
      />

      {/* Pro Tips Section */}
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
          <Icon name="sparkles" className="size-5 text-amber-500" />
          First-Landing Pro Tips for Gym Owners
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((tip, idx) => (
            <Card key={idx} className="p-5 flex flex-col justify-between border-border-subtle bg-surface hover:shadow-card transition">
              <div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3">
                  <Icon name={tip.icon} className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">{tip.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Step by Step Guide */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Icon name="list" className="size-5 text-brand-500" />
            Step-by-Step Gym Workflow
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Follow these 6 steps to take full advantage of automated billing, member management, and WhatsApp dispatch.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((item, idx) => (
            <Card key={idx} className="overflow-hidden border-border bg-surface transition shadow-sm">
              <div
                onClick={() => setActiveStep(activeStep === idx ? -1 : idx)}
                className="flex cursor-pointer items-center justify-between p-5 hover:bg-surface-2/50 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-sm font-black text-white shadow-xs">
                    {item.step}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                      <span className="hidden sm:inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Icon
                    name={activeStep === idx ? 'chevron-down' : 'chevron-right'}
                    className="size-5 text-muted-foreground transition"
                  />
                </div>
              </div>

              {activeStep === idx && (
                <div className="border-t border-border-subtle bg-surface-2/30 p-6 space-y-4">
                  <p className="text-xs text-foreground font-medium">{item.summary}</p>
                  
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Action Items:</p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {item.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <Icon name="check" className="size-3.5 text-success-500 mt-0.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Link to={item.to}>
                      <Button size="sm">
                        <Icon name={item.icon} className="size-3.5" />
                        {item.actionText} &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Need Help Banner */}
      <Card className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-500/10 via-surface to-brand-500/10 p-6 text-center shadow-card">
        <h3 className="text-base font-bold text-foreground">Need Personalized Help or Custom Setup?</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
          Our team is available to assist you with gym data import, WhatsApp gateway troubleshooting, or custom domain setup.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link to="/about">
            <Button variant="secondary" size="sm">About Gym Manager</Button>
          </Link>
          <Link to="/privacy-policy">
            <Button variant="secondary" size="sm">Privacy Policy</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
