export function formatINR(value) {
  const num = Number(value || 0)
  if (Number.isNaN(num)) return '₹0'
  return `₹${num.toLocaleString('en-IN')}`
}

export function formatNumber(value) {
  const num = Number(value || 0)
  if (Number.isNaN(num)) return '0'
  return num.toLocaleString('en-IN')
}

export function formatDate(value, withTime = false) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const opts = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }
  return date.toLocaleDateString('en-IN', opts)
}

export function daysUntil(value) {
  if (!value) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(value)
  end.setHours(0, 0, 0, 0)
  return Math.round((end - now) / 86400000)
}

export function titleCase(value) {
  if (!value) return ''
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function maskPhone(phone) {
  if (!phone) return ''
  return phone.replace(/^(\d{2})\d{4}(\d{4})$/, '$1••••$2')
}
