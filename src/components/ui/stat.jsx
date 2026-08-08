import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'

const accents = {
  brand: 'from-brand-500 to-brand-700',
  green: 'from-emerald-500 to-emerald-700',
  violet: 'from-violet-500 to-violet-700',
  orange: 'from-orange-500 to-orange-700',
  blue: 'from-sky-500 to-sky-700',
  red: 'from-red-500 to-red-700',
  amber: 'from-amber-500 to-amber-700',
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'brand',
  className,
  index = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'group rounded-2xl border border-border bg-surface p-5 text-foreground shadow-card transition-shadow hover:shadow-elevated',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105',
              accents[accent],
            )}
          >
            <Icon name={icon} className="size-5" />
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  )
}
