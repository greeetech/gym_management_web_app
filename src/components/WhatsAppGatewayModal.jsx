import { useState, useEffect } from 'react'
import api, { getErrorMessage } from '../services/api'
import Modal from './Modal'
import { Button } from './ui'
import { Icon } from './icons'
import { useToast } from './Toast'

export default function WhatsAppGatewayModal({ open, onClose }) {
  const [status, setStatus] = useState('DISCONNECTED')
  const [qrCode, setQrCode] = useState(null)
  const [phone, setPhone] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const checkStatus = async () => {
    try {
      const res = await api.get('/whatsapp-gateway/status')
      const data = res.data?.data || {}
      setStatus(data.status || 'DISCONNECTED')
      if (data.qrCode) setQrCode(data.qrCode)
      if (data.phone) setPhone(data.phone)
      if (data.status === 'CONNECTED') setQrCode(null)
    } catch (err) {
      console.error('Failed to get gateway status:', err)
    }
  }

  useEffect(() => {
    if (!open) return
    checkStatus()

    const timer = setInterval(() => {
      checkStatus()
    }, 2500)

    return () => clearInterval(timer)
  }, [open])

  const handleStartConnect = async () => {
    try {
      setLoading(true)
      const res = await api.post('/whatsapp-gateway/connect')
      const data = res.data?.data || {}
      setStatus(data.status || 'CONNECTING')
      if (data.qrCode) setQrCode(data.qrCode)
      toast.info('Generating WhatsApp QR Code. Please wait...')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to initialize WhatsApp Gateway'))
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setLoading(true)
      await api.post('/whatsapp-gateway/disconnect')
      setStatus('DISCONNECTED')
      setQrCode(null)
      setPhone(null)
      toast.success('WhatsApp Gateway disconnected successfully.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to disconnect WhatsApp Gateway'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="WhatsApp Multi-Device Gateway (Direct PDF Dispatch)">
      <div className="space-y-5">
        {status === 'CONNECTED' ? (
          <div className="rounded-2xl border border-success-200 bg-success-50 p-6 text-center dark:border-success-900/50 dark:bg-success-950/20">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-500 text-white shadow-md">
              <Icon name="check" className="size-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-success-900 dark:text-success-200">
              WhatsApp Connected & Active!
            </h3>
            <p className="mt-1 text-sm text-success-700 dark:text-success-300">
              Linked Phone: <span className="font-mono font-bold">+{phone || 'Active Device'}</span>
            </p>
            <div className="mt-4 rounded-xl bg-surface p-4 text-xs text-muted-foreground border border-border shadow-xs text-left">
              <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <span className="size-2 rounded-full bg-success-500 animate-pulse" />
                Automatic PDF Document Dispatch is ON
              </p>
              When a member registers, renews, or when you click Send PDF, the server automatically transmits the official <strong>.PDF document</strong> directly from your personal/gym WhatsApp number.
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="danger" onClick={handleDisconnect} disabled={loading}>
                {loading ? 'Disconnecting...' : 'Disconnect WhatsApp'}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-950/30 dark:text-brand-200">
              <p className="font-semibold">Scan QR Code with your Gym Phone once:</p>
              <ol className="mt-2 list-decimal list-inside space-y-1 text-xs text-brand-700 dark:text-brand-300">
                <li>Open <strong>WhatsApp</strong> on your phone</li>
                <li>Tap <strong>Settings</strong> (or 3 dots) &rarr; <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong> and point your camera at the QR code below</li>
              </ol>
            </div>

            {qrCode ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="rounded-2xl border-4 border-white bg-white p-3 shadow-lg">
                  <img src={qrCode} alt="WhatsApp QR Code" className="size-56 object-contain" />
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
                  <span className="size-2 rounded-full bg-brand-500" />
                  Waiting for phone scan... (Auto-refreshes)
                </p>
              </div>
            ) : status === 'CONNECTING' ? (
              <div className="py-12 text-center">
                <div className="inline-block size-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                <p className="mt-3 text-sm text-muted-foreground">Initializing WhatsApp session & QR code...</p>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                  <Icon name="message-circle" className="size-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No active WhatsApp session connected.
                </p>
                <Button onClick={handleStartConnect} disabled={loading} className="mx-auto">
                  <Icon name="qrcode" className="size-4" />
                  {loading ? 'Starting...' : 'Generate WhatsApp QR Code'}
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
