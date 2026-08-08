import { useTheme } from '../hooks/useTheme'
import { Icon } from './icons'
import { cn } from '../lib/utils'

export default function ThemeToggle({ className }) {
  const { mode, setMode, theme } = useTheme()

  const options = [
    { id: 'light', label: 'Light', icon: 'sun' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'system', label: 'System', icon: 'monitor' },
  ]

  return (
    <div
      className={cn('flex items-center rounded-xl border border-border bg-surface p-1 shadow-sm', className)}
      role="group"
      aria-label="Theme"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setMode(opt.id)}
          aria-pressed={mode === opt.id}
          title={`${opt.label} theme`}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
            mode === opt.id
              ? 'bg-brand-gradient text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon name={opt.icon} className="size-3.5" />
          <span className="hidden xl:inline">{opt.label}</span>
        </button>
      ))}
      <span className="sr-only">Active theme: {theme}</span>
    </div>
  )
}
