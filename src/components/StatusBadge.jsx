import { Badge } from './ui/badge'

const STATUS_VARIANT = {
  Active: 'success',
  active: 'success',
  Pending: 'warning',
  pending: 'warning',
  Inactive: 'neutral',
  'Expiry Soon': 'warning',
  Expired: 'danger',
  Cancelled: 'danger',
  paid: 'success',
  initiated: 'info',
  failed: 'danger',
  created: 'neutral',
  expired: 'neutral',
}

export default function StatusBadge({ status, dot = true }) {
  return (
    <Badge variant={STATUS_VARIANT[status] || 'neutral'} dot={dot}>
      {status || '—'}
    </Badge>
  )
}
