export const PHONE_RE = /^[6-9]\d{9}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidPhone(phone) {
  return PHONE_RE.test(String(phone || '').trim())
}

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim())
}

export function isValidName(name) {
  return Boolean(String(name || '').trim())
}

export function passwordScore(password) {
  const pwd = String(password || '')
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8) score += 1
  if (pwd.length >= 12) score += 1
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1
  if (/\d/.test(pwd)) score += 1
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1
  return Math.min(5, score)
}

export const PASSWORD_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
