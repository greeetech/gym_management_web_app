import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
        success: 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300',
        warning: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300',
        danger: 'bg-danger-50 text-danger-700 dark:bg-danger-500/15 dark:text-danger-300',
        info: 'bg-info-50 text-info-700 dark:bg-info-500/15 dark:text-info-300',
        neutral: 'bg-surface-2 text-muted-foreground border border-border',
        outline: 'border border-border bg-transparent text-muted-foreground',
      },
      dot: { true: '' },
    },
    defaultVariants: { variant: 'default' },
  },
)

const DOT_COLORS = {
  default: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  neutral: 'bg-muted-foreground/50',
  outline: 'bg-muted-foreground/50',
}

export function Badge({ className, variant = 'default', dot = false, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant, dot }), className)} {...props}>
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', DOT_COLORS[variant])} aria-hidden="true" />}
      {children}
    </span>
  )
}
