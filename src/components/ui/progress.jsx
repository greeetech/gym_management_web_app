import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Progress = forwardRef(function Progress({ value = 0, className, indicatorClassName }, ref) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div
        className={cn('h-full rounded-full bg-brand-gradient transition-all duration-500', indicatorClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
})
