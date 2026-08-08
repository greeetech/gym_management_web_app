import { cn } from '../lib/utils'

export function Skeleton({ className = '' }) {
  return <div className={cn('shimmer rounded-md bg-surface-3', className)} aria-hidden="true" />
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="border-b border-border-subtle px-4 py-4">
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="divide-y divide-border-subtle">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="size-9 rounded-full" />
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton({ className = 'h-64' }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-5 shadow-card', className)}>
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
