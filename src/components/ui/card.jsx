import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-surface text-foreground shadow-card', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 border-b border-border-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-sm font-bold text-foreground', className)} {...props} />
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-xs text-muted-foreground', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-3 border-t border-border-subtle px-5 py-4', className)}
      {...props}
    />
  )
}
