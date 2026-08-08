export const THEME_PRESETS = [
  { id: 'default-blue', name: 'Default Blue', swatch: '#2563eb' },
  { id: 'indigo', name: 'Indigo', swatch: '#4f46e5' },
  { id: 'emerald', name: 'Emerald', swatch: '#10b981' },
  { id: 'forest', name: 'Forest', swatch: '#16a34a' },
  { id: 'ocean', name: 'Ocean', swatch: '#0ea5e9' },
  { id: 'slate', name: 'Slate', swatch: '#64748b' },
  { id: 'rose', name: 'Rose', swatch: '#f43f5e' },
  { id: 'crimson', name: 'Crimson', swatch: '#dc2626' },
  { id: 'orange', name: 'Orange', swatch: '#f97316' },
  { id: 'amber', name: 'Amber', swatch: '#f59e0b' },
  { id: 'purple', name: 'Purple', swatch: '#7c3aed' },
  { id: 'graphite', name: 'Graphite', swatch: '#3f4656' },
  { id: 'minimal-white', name: 'Minimal White', swatch: '#f8fafc' },
  { id: 'cyber', name: 'Cyber', swatch: '#06b6d4' },
  { id: 'nord', name: 'Nord', swatch: '#5e81ac' },
]

export const THEME_IDS = new Set(THEME_PRESETS.map((t) => t.id))
