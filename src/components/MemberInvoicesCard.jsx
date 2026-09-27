import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../services/api'
import { useToast } from './Toast'
import { Button, Card, EmptyState } from './ui'
import { Icon } from './icons'
import { formatINR, formatDate } from '../utils/format'
import { waLink } from '../utils/whatsapp'

export default function MemberInvoicesCard({ memberId, memberPhone }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const toast = useToast()

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/invoices/member/${memberId}`)
      setInvoices(res.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (memberId) {
      fetchInvoices()
    }
  }, [memberId])

  const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
    try {
      setActionId(invoiceId)
      toast.info('Generating PDF receipt...')
      
      const res = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      })

      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_${invoiceNumber || invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Invoice downloaded successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to download invoice'))
    } finally {
      setActionId(null)
    }
  }

  const handleSendWhatsApp = async (invoiceId) => {
    try {
      setActionId(invoiceId)
      const res = await api.post(`/invoices/${invoiceId}/send-whatsapp`)
      const { phone, message } = res.data?.data || {}

      const targetPhone = phone || memberPhone
      if (!targetPhone) {
        toast.error('No valid phone number for this member')
        return
      }

      window.open(waLink(targetPhone, message), '_blank', 'noopener,noreferrer')
      toast.success('Opening WhatsApp with invoice details...')
      fetchInvoices()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to prepare WhatsApp message'))
    } finally {
      setActionId(null)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
            <Icon name="file-text" className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Invoices & Receipts History</h3>
            <p className="text-xs text-muted-foreground">Dynamic on-demand PDF receipts & WhatsApp delivery</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchInvoices} disabled={loading} title="Refresh receipts">
          <Icon name="refresh" className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="size-6 animate-spin rounded-full border-2 border-border border-t-brand-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <p>No past invoices recorded yet for this member.</p>
            <p className="mt-1 text-xs opacity-75">Invoices are automatically created when new memberships or renewals occur.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {invoices.map((inv) => {
              const snap = inv.snapshot || {}
              const isWorking = actionId === inv._id
              return (
                <div key={inv._id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{inv.invoiceNumber}</span>
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {inv.status || 'Paid'}
                      </span>
                      {inv.whatsappStatus?.isSent && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground" title={`WhatsApp sent at ${new Date(inv.whatsappStatus.sentAt).toLocaleString()}`}>
                          <Icon name="check" className="size-3 text-emerald-500" /> WhatsApp Sent
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                      <span>Plan: <strong className="text-foreground">{snap.planName}</strong> ({snap.duration})</span>
                      <span>•</span>
                      <span>Issued: {formatDate(snap.issueDate || inv.createdAt)}</span>
                      <span>•</span>
                      <span>Valid: {formatDate(snap.startDate)} to {formatDate(snap.expiryDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="mr-2 text-sm font-bold text-brand-600 tabular-nums">
                      {formatINR(snap.totalAmount)}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)}
                      disabled={isWorking}
                      title="Download PDF Receipt"
                    >
                      <Icon name="download" className="size-3.5" />
                      PDF
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSendWhatsApp(inv._id)}
                      disabled={isWorking}
                      className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                      title="Send Receipt to Member WhatsApp"
                    >
                      <Icon name="message-circle" className="size-3.5 text-emerald-500" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
