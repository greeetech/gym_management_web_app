import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../services/api'
import { useToast } from './Toast'
import { Button, Card } from './ui'
import { Icon } from './icons'
import { formatINR, formatDate } from '../utils/format'
import { waLink } from '../utils/whatsapp'
import InvoicePreviewModal from './InvoicePreviewModal'
import WhatsAppGatewayModal from './WhatsAppGatewayModal'

export default function MemberInvoicesCard({ memberId, memberPhone }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [gatewayStatus, setGatewayStatus] = useState('DISCONNECTED')
  const [gatewayPhone, setGatewayPhone] = useState(null)
  const toast = useToast()

  const checkGatewayStatus = async () => {
    try {
      const res = await api.get('/whatsapp-gateway/status')
      const data = res.data?.data || {}
      setGatewayStatus(data.status || 'DISCONNECTED')
      if (data.phone) setGatewayPhone(data.phone)
    } catch (_) {}
  }

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
      checkGatewayStatus()
    }
  }, [memberId])

  const handleGenerateManual = async () => {
    try {
      setLoading(true)
      toast.info('Generating official invoice for member...')
      const res = await api.post(`/invoices/generate-manual/${memberId}`, { paymentMode: 'Cash' })
      toast.success('Official invoice created successfully!')
      fetchInvoices()
      if (res.data?.data) {
        setSelectedInvoice(res.data.data)
        setPreviewOpen(true)
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to generate invoice. Ensure member has an active membership.'))
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
    try {
      setActionId(invoiceId)
      toast.info('Generating PDF receipt...')
      const res = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' })
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

  const handleSendWhatsApp = async (invoiceId, invoiceNumber) => {
    setActionId(invoiceId)

    // 1. If WhatsApp Gateway is connected, send direct PDF document!
    if (gatewayStatus === 'CONNECTED') {
      try {
        toast.info('Sending official PDF document directly to member WhatsApp...')
        const res = await api.post('/whatsapp-gateway/send-pdf', { invoiceId })
        toast.success(res.data?.message || 'PDF invoice document delivered to member WhatsApp!')
        fetchInvoices()
        setActionId(null)
        return
      } catch (err) {
        console.warn('Direct WhatsApp dispatch failed, falling back to web link:', err)
      }
    }

    // 2. Fallback: Trigger download & open WhatsApp Web
    handleDownloadPdf(invoiceId, invoiceNumber).catch(() => {})
    try {
      const res = await api.post(`/invoices/${invoiceId}/send-whatsapp`)
      const { phone, message } = res.data?.data || {}
      const targetPhone = phone || memberPhone
      if (!targetPhone) {
        toast.error('No valid phone number for this member')
        return
      }
      window.open(waLink(targetPhone, message), '_blank', 'noopener,noreferrer')
      toast.success('PDF downloaded & WhatsApp opened! Link WhatsApp QR to send PDF files automatically.')
      fetchInvoices()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to prepare WhatsApp message'))
    } finally {
      setActionId(null)
    }
  }

  const openPreview = (inv) => {
    setSelectedInvoice(inv)
    setPreviewOpen(true)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Icon name="file-text" className="size-4 text-brand-500" />
              Payment Receipts & Invoices
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Snapshot billing records (Zero Cloudinary &bull; Dynamic on-the-fly PDF &bull; WhatsApp dispatch)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {gatewayStatus === 'CONNECTED' ? (
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-success-50 border border-success-200 px-2.5 py-1 text-xs font-semibold text-success-700 transition hover:bg-success-100 dark:bg-success-950/30 dark:border-success-800 dark:text-success-300"
                title="WhatsApp Gateway is active and sending real PDF files"
              >
                <span className="size-2 rounded-full bg-success-500 animate-pulse" />
                WhatsApp Linked (+{gatewayPhone || 'Active'})
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 border border-border px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-brand-500 hover:text-brand-600"
                title="Link your WhatsApp once to deliver real PDF files automatically"
              >
                <Icon name="qrcode" className="size-3.5" />
                Link WhatsApp (QR Code)
              </button>
            )}

            
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
              <Icon name="file-text" className="size-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">No invoices generated yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click &quot;Generate Official Invoice&quot; to issue a branded PDF receipt for this member.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-2 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="transition hover:bg-surface-2/50">
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-foreground">
                      {inv.snapshot?.planName || 'Membership'}
                      <span className="block text-[11px] text-muted-foreground">
                        {inv.snapshot?.duration || ''}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-foreground">
                      {formatINR(inv.snapshot?.totalAmount || 0)}
                      <span className="block text-[11px] text-muted-foreground">
                        {inv.snapshot?.paymentMode || 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground tabular-nums">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-950/40 dark:text-success-300">
                        {inv.status || 'Paid'}
                      </span>
                      {inv.whatsappStatus?.isSent && (
                        <span className="mt-0.5 block text-[10px] text-muted-foreground" title={inv.whatsappStatus?.mode === 'DIRECT_PDF' ? 'Delivered as real PDF file' : 'Sent via WhatsApp'}>
                          ✓ {inv.whatsappStatus?.mode === 'DIRECT_PDF' ? 'PDF Delivered' : 'WA Sent'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openPreview(inv)}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-surface-2 hover:border-brand-500"
                          title="Visual Preview / Print Receipt"
                        >
                          👁️ Preview
                        </button>
                        <button
                          type="button"
                          disabled={actionId === inv._id}
                          onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-surface-2 hover:border-brand-500"
                          title="Download on-the-fly PDF"
                        >
                          📄 PDF
                        </button>
                        <button
                          type="button"
                          disabled={actionId === inv._id}
                          onClick={() => handleSendWhatsApp(inv._id, inv.invoiceNumber)}
                          className="rounded-lg border border-success-300 bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700 transition hover:bg-success-100 dark:border-success-800 dark:bg-success-950/40 dark:text-success-300"
                          title={gatewayStatus === 'CONNECTED' ? 'Send real PDF file directly to member WhatsApp' : 'Open WhatsApp with PDF'}
                        >
                          {gatewayStatus === 'CONNECTED' ? '📲 Send PDF' : '📲 WhatsApp'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={selectedInvoice}
        onWhatsAppSent={() => {
          fetchInvoices()
          checkGatewayStatus()
        }}
      />

      <WhatsAppGatewayModal
        open={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false)
          checkGatewayStatus()
        }}
      />
    </>
  )
}
