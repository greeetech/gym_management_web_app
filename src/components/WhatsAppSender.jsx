import { useEffect, useState } from 'react'
import Modal from './Modal'
import { Alert, Button, Field, NativeSelect, inputClass } from './ui'
import { waLink } from '../utils/whatsapp'
import { formatDate, daysUntil } from '../utils/format'

const DEFAULT_TEMPLATES = {
  welcome: 'Hi {{member}}, welcome to {{gym}}! Your {{plan}} membership is now active. We are excited to have you train with us.',
  renewal: 'Hi {{member}}, a friendly reminder that your {{plan}} membership at {{gym}} ends on {{endDate}} ({{days}} day(s) left). Renew now to keep your workouts going.',
  birthday: 'Happy Birthday {{member}}! Wishing you good health and happiness from everyone at {{gym}}.',
  expiry: 'Hi {{member}}, your {{plan}} membership at {{gym}} expires on {{endDate}}. Extend today so you never miss a session.',
  promo: 'Hi {{member}}, we have a special offer at {{gym}}. Contact us today to grab it before it expires.',
  custom: '',
}

const TEMPLATE_OPTIONS = [
  { value: 'renewal', label: 'Renewal reminder' },
  { value: 'expiry', label: 'Expiry alert' },
  { value: 'welcome', label: 'Welcome message' },
  { value: 'birthday', label: 'Birthday wish' },
  { value: 'promo', label: 'Promotional offer' },
  { value: 'custom', label: 'Custom message' },
]

const VARIABLES = ['{{member}}', '{{gym}}', '{{plan}}', '{{endDate}}', '{{days}}']

function fillTemplate(template, ctx) {
  return String(template || '').replace(/\{\{(\w+)\}\}/g, (_, key) => ctx[key] ?? `{{${key}}}`)
}

function buildCtx(member, membership, gymName) {
  return {
    member: member?.fullName || 'there',
    gym: gymName,
    plan: membership?.name || 'membership',
    endDate: membership?.endDate ? formatDate(membership.endDate) : '',
    days: membership?.endDate ? String(daysUntil(membership.endDate) ?? '') : '',
  }
}

function insertVariable(message, variable, setMessage) {
  setMessage((prev) => {
    if (!prev || !prev.includes(variable)) return `${prev}${variable}`
    return prev
  })
}

export default function WhatsAppSender({ open, onClose, member, membership, gymName = 'our gym' }) {
  const [templateKey, setTemplateKey] = useState('renewal')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) return
    const ctx = buildCtx(member, membership, gymName)
    setTemplateKey('renewal')
    setMessage(fillTemplate(DEFAULT_TEMPLATES.renewal, ctx))
  }, [open, member, membership, gymName])

  const handleTemplateChange = (key) => {
    setTemplateKey(key)
    setMessage(fillTemplate(DEFAULT_TEMPLATES[key], buildCtx(member, membership, gymName)))
  }

  const phone = member?.phone || ''
  const canSend = !!phone

  const handleSend = () => {
    if (!canSend) return
    window.open(waLink(phone, message.trim()), '_blank', 'noopener,noreferrer')
    onClose?.()
  }

  return (
    <Modal open={open} onClose={onClose} title="Send WhatsApp message">
      <div className="space-y-4">
        <div className="rounded-xl bg-success-50 p-4 text-sm text-success-700">
          Message opens in WhatsApp as the gym owner&apos;s number. Review and hit send.
        </div>

        {!canSend && <Alert>This member has no phone number saved.</Alert>}

        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-semibold text-foreground">{member?.fullName || 'Member'}</p>
          {member?.phone && <p className="text-xs text-muted-foreground tabular-nums">+91 {member.phone}</p>}
          {membership && (
            <p className="mt-1 text-xs text-muted-foreground">
              {membership.name} · ends {formatDate(membership.endDate)}
            </p>
          )}
        </div>

        <Field label="Template">
          <NativeSelect value={templateKey} onChange={(e) => handleTemplateChange(e.target.value)}>
            {TEMPLATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Message">
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className={inputClass(false, 'w-full resize-y')}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Insert:</span>
          {VARIABLES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(message, v, setMessage)}
              className="rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs font-mono text-foreground transition hover:border-brand-400 hover:text-brand-600"
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSend} disabled={!canSend}>
            Open WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  )
}
