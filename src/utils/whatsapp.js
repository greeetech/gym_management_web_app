export const DEFAULT_COUNTRY_CODE = '91'

export function normalizeWhatsAppNumber(phone, countryCode = DEFAULT_COUNTRY_CODE) {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 10) digits = `${countryCode}${digits}`
  return digits
}

export function waLink(phone, message = '', countryCode = DEFAULT_COUNTRY_CODE) {
  const digits = normalizeWhatsAppNumber(phone, countryCode)
  const text = encodeURIComponent(message || '')
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`
}
