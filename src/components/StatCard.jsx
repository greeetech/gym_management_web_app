import { Link } from 'react-router-dom'
import { Icon } from './icons'
import { cn } from '../lib/utils'

const ACCENTS = {
  brand: 'bg-brand-gradient',
  green: 'bg-success-gradient',
  amber: 'bg-gradient-to-br from-amber-400 to-amber-600',
  orange: 'bg-warning-gradient',
  red: 'bg-danger-gradient',
  violet: 'bg-gradient-to-br from-violet-500 to-violet-700',
  cyan: 'bg-gradient-to-br from-cyan-500 to-sky-600',
  slate: 'bg-gradient-to-br from-slate-500 to-slate-700',
}

export default function StatCard({ label, value, icon, accent = 'brand', sub, hint, to, className }) {
  const gradient = ACCENTS[accent] || ACCENTS.brand
  const content = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 text-foreground shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated',
        to && 'cursor-pointer',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${gradient}`}>
          <Icon name={icon || 'list'} className="size-6" />
        </div>
      </div>
      {hint && <div className="mt-3 text-xs text-muted-foreground">{hint}</div>}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition group-hover:opacity-20 ${gradient}`}
      />
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    )
  }

  return content
}
