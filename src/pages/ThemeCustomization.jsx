import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { THEME_PRESETS, FONT_OPTIONS, RADIUS_OPTIONS } from '../lib/theme-presets'
import { useToast } from '../components/Toast'
import api from '../services/api'
import { Icon } from '../components/icons'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Field } from '../components/ui/field'
import { inputClass } from '../components/ui'
import InstallPwaButton from '../components/InstallPwaButton'
import { cn } from '../lib/utils'

const ACCENT_SHORTCUTS = [
  { label: 'Indigo', hex: '#4f46e5' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Electric Blue', hex: '#0ea5e9' },
  { label: 'Sunset Coral', hex: '#f97316' },
  { label: 'Crimson Red', hex: '#dc2626' },
  { label: 'Cyber Teal', hex: '#06b6d4' },
  { label: 'Royal Violet', hex: '#7c3aed' },
  { label: 'Rose Gold', hex: '#f43f5e' },
  { label: 'Golden Amber', hex: '#f59e0b' },
  { label: 'Lime Power', hex: '#84cc16' },
]

export default function ThemeCustomization() {
  const { customization, mode, theme, setMode, updateCustomization } = useTheme()
  const toast = useToast()

  const [selectedTheme, setSelectedTheme] = useState(theme || 'indigo')
  const [selectedMode, setSelectedMode] = useState(mode || 'system')
  const [primaryColor, setPrimaryColor] = useState(customization?.primaryColor || '')
  const [borderRadius, setBorderRadius] = useState(customization?.borderRadius || '0.5rem')
  const [fontFamily, setFontFamily] = useState(customization?.fontFamily || 'Inter')
  const [gymName, setGymName] = useState(customization?.gymName || '')
  const [gymLogo, setGymLogo] = useState(customization?.gymLogo || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (customization) {
      if (customization.theme) setSelectedTheme(customization.theme)
      if (customization.primaryColor !== undefined) setPrimaryColor(customization.primaryColor)
      if (customization.borderRadius) setBorderRadius(customization.borderRadius)
      if (customization.fontFamily) setFontFamily(customization.fontFamily)
      if (customization.gymName) setGymName(customization.gymName)
      if (customization.gymLogo) setGymLogo(customization.gymLogo)
    }
  }, [customization])

  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId)
    updateCustomization?.({ theme: themeId }, false)
  }

  const handleSelectMode = (newMode) => {
    setSelectedMode(newMode)
    setMode(newMode)
    updateCustomization?.({ mode: newMode }, false)
  }

  const handleColorChange = (hex) => {
    setPrimaryColor(hex)
    updateCustomization?.({ primaryColor: hex }, false)
  }

  const handleClearColorOverride = () => {
    setPrimaryColor('')
    updateCustomization?.({ primaryColor: '' }, false)
  }

  const handleSelectRadius = (radius) => {
    setBorderRadius(radius)
    updateCustomization?.({ borderRadius: radius }, false)
  }

  const handleSelectFont = (font) => {
    setFontFamily(font)
    updateCustomization?.({ fontFamily: font }, false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        themePreset: selectedTheme,
        mode: selectedMode,
        primaryColor,
        borderRadius,
        fontFamily,
        gymName,
        gymLogo,
      }
      await api.put('/setup/step/customization', payload)
      if (typeof updateCustomization === 'function') {
        updateCustomization?.({
          theme: selectedTheme,
          mode: selectedMode,
          primaryColor,
          borderRadius,
          fontFamily,
          gymName,
          gymLogo,
        }, false)
      }
      toast.success('Theme & Branding published successfully!')
    } catch (err) {
      console.error('Failed to save customization:', err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to save theme settings'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSelectedTheme('indigo')
    setSelectedMode('system')
    setPrimaryColor('')
    setBorderRadius('0.5rem')
    setFontFamily('Inter')
    updateCustomization?.(
      {
        theme: 'indigo',
        mode: 'system',
        primaryColor: '',
        borderRadius: '0.5rem',
        fontFamily: 'Inter',
      },
      false,
    )
    toast.info('Theme reset to defaults. Click Save to persist.')
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Theme & White-Label Customization
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your brand colors, typography, UI geometry, and installable PWA experience.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} icon="rotate-ccw">
            Reset
          </Button>
          <Button onClick={handleSave} loading={saving} icon="check" className="shadow-lg shadow-brand-500/25">
            Save & Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-7">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-base font-bold text-foreground">1. Brand Theme Presets</h2>
                <p className="text-xs text-muted-foreground">
                  Select a curated palette engineered for modern fitness and wellness businesses.
                </p>
              </div>
              <Badge color="blue" className="text-xs">
                {THEME_PRESETS.length} Presets Available
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {THEME_PRESETS.map((preset) => {
                const isActive = selectedTheme === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectTheme(preset.id)}
                    className={cn(
                      'group relative flex flex-col rounded-xl border p-3 text-left transition-all',
                      isActive
                        ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30 shadow-md'
                        : 'border-border bg-surface-2 hover:border-border-strong hover:bg-surface-3',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-4 shrink-0 rounded-full shadow-sm ring-1 ring-black/10"
                          style={{ backgroundColor: preset.swatch }}
                        />
                        <span className="text-xs font-bold text-foreground truncate">{preset.name}</span>
                      </div>
                      {isActive && <Icon name="check" className="size-3.5 text-brand-600 dark:text-brand-400" />}
                    </div>

                    <div className={cn('mt-2 h-2 w-full rounded-full bg-gradient-to-r', preset.gradient)} />
                    <span className="mt-1 text-[10px] text-muted-foreground">{preset.category}</span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">2. Display Mode & Custom Hex Override</h2>
              <p className="text-xs text-muted-foreground">
                Set default light/dark mode and optionally override with your gym's exact brand hex code.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interface Color Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: 'sun' },
                  { id: 'dark', label: 'Dark', icon: 'moon' },
                  { id: 'system', label: 'Auto (System)', icon: 'monitor' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectMode(opt.id)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition',
                      selectedMode === opt.id
                        ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                        : 'border-border bg-surface-2 text-foreground hover:bg-surface-3',
                    )}
                  >
                    <Icon name={opt.icon} className="size-3.5" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Custom Brand Primary Color (Optional)
                </label>
                {primaryColor && (
                  <button
                    type="button"
                    onClick={handleClearColorOverride}
                    className="text-xs text-danger-500 hover:underline"
                  >
                    Clear custom color
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor || '#4f46e5'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="size-10 cursor-pointer rounded-xl border border-border bg-transparent p-1"
                />
                <input
                  type="text"
                  placeholder="#4f46e5 (leave blank for preset default)"
                  value={primaryColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className={cn(inputClass(false), 'flex-1 font-mono text-sm')}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1">Quick picks:</span>
                {ACCENT_SHORTCUTS.map((s) => (
                  <button
                    key={s.hex}
                    type="button"
                    onClick={() => handleColorChange(s.hex)}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition',
                      primaryColor.toLowerCase() === s.hex.toLowerCase()
                        ? 'bg-foreground text-background ring-1 ring-border'
                        : 'bg-surface-3 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className="size-2 rounded-full" style={{ backgroundColor: s.hex }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">3. Typography & UI Geometry</h2>
              <p className="text-xs text-muted-foreground">
                Fine-tune font style and component border rounding across your platform.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Typography Font Family
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {FONT_OPTIONS.map((f) => {
                  const isActive = fontFamily === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFont(f.id)}
                      className={cn(
                        'flex flex-col rounded-xl border p-3 text-left transition',
                        isActive
                          ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                          : 'border-border bg-surface-2 hover:bg-surface-3',
                      )}
                      style={{ fontFamily: `"${f.id}", sans-serif` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">{f.name}</span>
                        {isActive && <Icon name="check" className="size-4 text-brand-500" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5">{f.description}</span>
                      <span className="mt-2 text-xs font-medium text-foreground/80">
                        The quick brown fox jumps over the lazy dog. 12345
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Border Radius (Component Curvature)
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {RADIUS_OPTIONS.map((r) => {
                  const isActive = borderRadius === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRadius(r.id)}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 border text-center transition',
                        r.preview,
                        isActive
                          ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30 text-brand-600 dark:text-brand-400 font-bold'
                          : 'border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface-3',
                      )}
                    >
                      <span className="text-xs font-semibold">{r.label}</span>
                      <span className="text-[10px] opacity-75">{r.px}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">4. White-Label Branding</h2>
              <p className="text-xs text-muted-foreground">
                Set your custom gym name and logo URL to brand your portal and navigation.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Gym Brand Name">
                <input
                  type="text"
                  placeholder="e.g. Iron Fortress Gym"
                  value={gymName}
                  onChange={(e) => {
                    setGymName(e.target.value)
                    updateCustomization?.({ gymName: e.target.value }, false)
                  }}
                  className={inputClass(false)}
                />
              </Field>

              <Field label="Gym Logo Image URL">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={gymLogo}
                  onChange={(e) => {
                    setGymLogo(e.target.value)
                    updateCustomization?.({ gymLogo: e.target.value }, false)
                  }}
                  className={inputClass(false)}
                />
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-5">
          <Card className="relative overflow-hidden border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-surface-2 to-surface p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  <Icon name="sparkles" className="size-3" />
                  Installable Web App (PWA)
                </span>
                <h3 className="text-lg font-extrabold text-foreground">Install on Mobile or Desktop</h3>
                <p className="text-xs text-muted-foreground">
                  Your tenant portal is built as an installable Progressive Web Application. Install it on your phone or PC with zero app store hassle!
                </p>
              </div>

              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md">
                <Icon name="smartphone" className="size-6" />
              </div>
            </div>

            <div className="mt-5">
              <InstallPwaButton className="w-full justify-center py-3 text-sm font-bold shadow-md" />
            </div>
          </Card>

          <Card className="sticky top-6 p-6 space-y-4 border-2 border-border shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="size-3 rounded-full bg-red-500/80" />
                  <span className="size-3 rounded-full bg-yellow-500/80" />
                  <span className="size-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-bold text-foreground ml-2">Live Portal Preview</span>
              </div>
              <Badge color="green" className="text-[10px]">
                Interactive
              </Badge>
            </div>

            <div
              className="rounded-2xl border border-border bg-surface p-4 shadow-inner transition-all space-y-4"
              style={{
                fontFamily: `"${fontFamily}", sans-serif`,
              }}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  {gymLogo ? (
                    <img src={gymLogo} alt="Logo" className="size-7 rounded-lg object-contain" />
                  ) : (
                    <div className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
                      <Icon name="dumbbell" className="size-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-extrabold text-foreground leading-none">
                      {gymName || 'Gym Manager'}
                    </p>
                    <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Owner Portal</p>
                  </div>
                </div>

                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-xl border border-border bg-surface-2 p-3 space-y-1"
                  style={{ borderRadius }}
                >
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Active Members</p>
                  <p className="text-lg font-black text-foreground">348</p>
                  <span className="text-[9px] font-bold text-emerald-500">+12% this month</span>
                </div>

                <div
                  className="rounded-xl border border-border bg-surface-2 p-3 space-y-1"
                  style={{ borderRadius }}
                >
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Monthly Revenue</p>
                  <p className="text-lg font-black text-brand-600 dark:text-brand-400">₹1,84,500</p>
                  <span className="text-[9px] font-bold text-emerald-500">98% collected</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Component Preview
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="bg-brand-gradient px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                    style={{ borderRadius }}
                  >
                    Primary Action
                  </button>
                  <button
                    type="button"
                    className="border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-3"
                    style={{ borderRadius }}
                  >
                    Secondary
                  </button>
                  <Badge color="blue" className="text-[10px]">
                    Active Plan
                  </Badge>
                </div>
              </div>

              <div
                className="flex items-center justify-between rounded-xl border border-border bg-surface-2/60 p-2.5 text-xs"
                style={{ borderRadius }}
              >
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-[10px]">
                    AS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Akhilesh Soni</p>
                    <p className="text-[9px] text-muted-foreground">Silver Plan · Active</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  Paid
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
