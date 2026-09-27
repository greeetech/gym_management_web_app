import Modal from './Modal'
import { Button } from './ui'
import { Icon } from './icons'
import { formatINR, formatDate } from '../utils/format'
import { waLink } from '../utils/whatsapp'
import api, { getErrorMessage } from '../services/api'
import { useToast } from './Toast'
import { useState } from 'react'

export default function InvoicePreviewModal({ open, onClose, invoice, onWhatsAppSent }) {
  const [sending, setSending] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const toast = useToast()

  if (!invoice) return null
  const snap = invoice.snapshot || {}

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const res = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(snap.gymName || 'Gym').replace(/\s+/g, '_')}_${(snap.memberName || 'Member').replace(/\s+/g, '_')}_${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Invoice PDF downloaded successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to download PDF'))
    } finally {
      setDownloading(false)
    }
  }

    const handleSendWhatsApp = async () => {
    try {
      setSending(true)
      // Check if WhatsApp Gateway is connected for direct PDF document dispatch
      try {
        const gwRes = await api.get('/whatsapp-gateway/status')
        if (gwRes.data?.data?.status === 'CONNECTED') {
          toast.info('Sending official PDF document directly to member WhatsApp...')
          const directRes = await api.post('/whatsapp-gateway/send-pdf', { invoiceId: invoice._id })
          toast.success(directRes.data?.message || 'Official PDF document delivered to member WhatsApp! 📄')
          onWhatsAppSent?.()
          setSending(false)
          return
        }
      } catch (_) {}

      // Fallback: Trigger download & open WhatsApp Web
      handleDownload().catch(() => {})
      const res = await api.post(`/invoices/${invoice._id}/send-whatsapp`)
      const { phone, message } = res.data?.data || {}
      const targetPhone = phone || snap.memberPhone
      if (!targetPhone) {
        toast.error('Member phone number is missing')
        return
      }
      window.open(waLink(targetPhone, message), '_blank', 'noopener,noreferrer')
      toast.success('PDF invoice downloaded & WhatsApp opened! Link WhatsApp QR to send PDF files automatically.')
      onWhatsAppSent?.()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to prepare WhatsApp message'))
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Official Payment Receipt & Invoice">
      <div className="space-y-6">
        <div id="invoice-printable" className="rounded-2xl border border-border bg-card p-6 shadow-sm text-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border-subtle pb-5">
            <div>
              <h2 className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400 uppercase">
                {snap.gymName || 'FITNESS CLUB'}
              </h2>
              {snap.gymAddress && <p className="text-xs text-muted-foreground mt-0.5">{snap.gymAddress}</p>}
              <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                {snap.gymPhone && <span>Phone: {snap.gymPhone}</span>}
                {snap.gymEmail && <span>Email: {snap.gymEmail}</span>}
                {snap.gstNumber && <span>GSTIN: {snap.gstNumber}</span>}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Payment Receipt
              </span>
              <p className="mt-1.5 font-mono text-sm font-bold text-foreground">#{invoice.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">Date: {formatDate(snap.issueDate || invoice.createdAt)}</p>
              <p className="text-xs text-muted-foreground">Mode: <strong className="text-foreground">{snap.paymentMode || 'Cash'}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-border-subtle text-xs">
            <div className="rounded-xl bg-surface-2 p-3.5 space-y-1">
              <p className="font-bold uppercase tracking-wider text-brand-500">Billed To (Member)</p>
              <p className="text-sm font-extrabold text-foreground">{snap.memberName}</p>
              {snap.memberPhone && <p className="text-muted-foreground">Phone: {snap.memberPhone}</p>}
              {snap.memberEmail && <p className="text-muted-foreground">Email: {snap.memberEmail}</p>}
              {snap.memberIdNumber && <p className="text-muted-foreground">ID: {snap.memberIdNumber}</p>}
            </div>

            <div className="rounded-xl bg-surface-2 p-3.5 space-y-1">
              <p className="font-bold uppercase tracking-wider text-brand-500">Membership Validity</p>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-semibold text-foreground">{formatDate(snap.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiry Date:</span>
                <span className="font-bold text-danger-500">{formatDate(snap.expiryDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold text-foreground">{snap.duration}</span>
              </div>
            </div>
          </div>

          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-bold uppercase tracking-wider">Plan Description</th>
                  <th className="pb-2 text-center font-bold uppercase tracking-wider">Duration</th>
                  <th className="pb-2 text-right font-bold uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr>
                  <td className="py-3">
                    <p className="font-bold text-foreground text-sm">{snap.planName}</p>
                    <p className="text-[11px] text-muted-foreground">Full facility gym membership</p>
                  </td>
                  <td className="py-3 text-center text-muted-foreground">{snap.duration}</td>
                  <td className="py-3 text-right font-bold text-foreground tabular-nums">
                    {formatINR(snap.basePrice || snap.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-border pt-4 flex flex-col items-end space-y-1.5 text-xs">
            <div className="flex justify-between w-48 text-muted-foreground">
              <span>Subtotal:</span>
              <span className="text-foreground">{formatINR(snap.basePrice || snap.totalAmount)}</span>
            </div>
            {snap.discount > 0 && (
              <div className="flex justify-between w-48 text-emerald-600">
                <span>Discount:</span>
                <span>-{formatINR(snap.discount)}</span>
              </div>
            )}
            <div className="flex justify-between w-48 border-t border-border pt-2 text-sm font-extrabold text-foreground">
              <span>Grand Total:</span>
              <span className="text-brand-600 tabular-nums">{formatINR(snap.totalAmount)}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-border-subtle pt-3 text-[10px] text-muted-foreground">
            <p className="font-semibold text-foreground">Terms & Conditions:</p>
            <p>{snap.terms || 'Fees paid are non-refundable. Please follow gym safety rules and timings at all times.'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="secondary" onClick={() => window.print()} title="Print this receipt">
            <Icon name="printer" className="size-4" /> Print
          </Button>
          <Button variant="secondary" onClick={handleDownload} disabled={downloading}>
            <Icon name="download" className="size-4" /> {downloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          <Button onClick={handleSendWhatsApp} disabled={sending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Icon name="message-circle" className="size-4 text-white" /> {sending ? 'Opening...' : 'Send on WhatsApp'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
