import { useState } from 'react'
import { NativeSelect, inputClass } from './ui'

const EXPIRY_PRESETS = [
  { value: '', label: 'Any time' },
  { value: '5', label: 'Expires in 5 days' },
  { value: '15', label: 'Expires in 15 days' },
  { value: '30', label: 'Expires in 30 days' },
  { value: '60', label: 'Expires in 60 days' },
]

export default function ExpiryFilter({ value, onChange, className = 'w-48' }) {
  const numValue = value === '' || value == null ? '' : Number(value)
  const isPreset = EXPIRY_PRESETS.some((o) => o.value !== '' && Number(o.value) === numValue)
  const isCustom = numValue !== '' && !isPreset
  const [customOpen, setCustomOpen] = useState(isCustom)

  const handleSelect = (val) => {
    if (val === 'custom') {
      setCustomOpen(true)
      return
    }
    setCustomOpen(false)
    onChange(val === '' ? '' : Number(val))
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted-foreground sm:block">Expires in:</span>
      <NativeSelect
        value={isCustom ? 'custom' : String(numValue)}
        onChange={(e) => handleSelect(e.target.value)}
        className={className}
      >
        {EXPIRY_PRESETS.map((o) => (
          <option key={o.value || 'any'} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value="custom">Custom…</option>
      </NativeSelect>
      {customOpen && (
        <input
          type="number"
          min="1"
          placeholder="Days"
          aria-label="Custom expiry days"
          value={isCustom ? numValue : ''}
          onChange={(e) => {
            const v = Number(e.target.value)
            onChange(v > 0 ? v : '')
          }}
          className={inputClass(false, 'w-24')}
        />
      )}
    </div>
  )
}
