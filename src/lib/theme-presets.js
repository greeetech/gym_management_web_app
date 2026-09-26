export const THEME_PRESETS = [
  { id: 'indigo', name: 'Royal Indigo', swatch: '#4f46e5', gradient: 'from-indigo-600 to-violet-600', category: 'Modern Tech' },
  { id: 'emerald', name: 'Emerald Power', swatch: '#10b981', gradient: 'from-emerald-600 to-teal-600', category: 'Health & Vitality' },
  { id: 'crimson', name: 'Crimson Surge', swatch: '#dc2626', gradient: 'from-red-600 to-rose-600', category: 'High Energy' },
  { id: 'ocean', name: 'Ocean Wave', swatch: '#0ea5e9', gradient: 'from-sky-500 to-blue-600', category: 'Calm & Flow' },
  { id: 'forest', name: 'Deep Forest', swatch: '#16a34a', gradient: 'from-green-600 to-emerald-700', category: 'Natural Strength' },
  { id: 'orange', name: 'Vibrant Orange', swatch: '#f97316', gradient: 'from-orange-500 to-amber-600', category: 'High Energy' },
  { id: 'cyber', name: 'Cyber Neon', swatch: '#06b6d4', gradient: 'from-cyan-500 to-blue-500', category: 'Futuristic' },
  { id: 'purple', name: 'Neon Purple', swatch: '#7c3aed', gradient: 'from-purple-600 to-pink-600', category: 'Modern Tech' },
  { id: 'rose', name: 'Rose Gold', swatch: '#f43f5e', gradient: 'from-rose-500 to-pink-600', category: 'Premium' },
  { id: 'amber', name: 'Golden Amber', swatch: '#f59e0b', gradient: 'from-amber-500 to-orange-500', category: 'Warm & Active' },
  { id: 'nord', name: 'Nordic Frost', swatch: '#5e81ac', gradient: 'from-slate-600 to-blue-700', category: 'Minimalist' },
  { id: 'graphite', name: 'Dark Graphite', swatch: '#3f4656', gradient: 'from-zinc-700 to-slate-800', category: 'Dark & Sleek' },
  { id: 'slate', name: 'Slate Steel', swatch: '#64748b', gradient: 'from-slate-500 to-zinc-600', category: 'Minimalist' },
  { id: 'default-blue', name: 'Corporate Blue', swatch: '#2563eb', gradient: 'from-blue-600 to-indigo-700', category: 'Classic' },
  { id: 'minimal-white', name: 'Crisp White', swatch: '#f8fafc', gradient: 'from-slate-200 to-zinc-400', category: 'Minimalist' },
]

export const THEME_IDS = new Set(THEME_PRESETS.map((t) => t.id))

export const FONT_OPTIONS = [
  { id: 'Inter', name: 'Inter', description: 'Clean, neutral and ultra-crisp modern interface font' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', description: 'Contemporary high-end SaaS font with geometric elegance' },
  { id: 'Outfit', name: 'Outfit', description: 'Bold, athletic, dynamic typography built for modern fitness brands' },
  { id: 'Poppins', name: 'Poppins', description: 'Friendly geometric sans with warm curves and high readability' },
  { id: 'Roboto', name: 'Roboto', description: 'Classic material aesthetic with balanced proportions' },
]

export const RADIUS_OPTIONS = [
  { id: '0.25rem', label: 'Sharp', preview: 'rounded-sm', px: '4px' },
  { id: '0.5rem', label: 'Modern (Default)', preview: 'rounded-lg', px: '8px' },
  { id: '0.75rem', label: 'Smooth Curved', preview: 'rounded-xl', px: '12px' },
  { id: '1.25rem', label: 'Soft Pill', preview: 'rounded-3xl', px: '20px' },
]
