import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'

const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        error: 'border-danger-200 bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-300',
        success: 'border-success-200 bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300',
        warning: 'border-warning-200 bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300',
        info: 'border-info-200 bg-info-50 text-info-700 dark:bg-info-500/10 dark:text-info-300',
        default: 'border-border bg-surface-2 text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const alertIcons = {
  error: 'triangle-alert',
  success: 'check-circle',
  warning: 'triangle-alert',
  info: 'info',
  default: 'info',
}

export function Alert({ variant = 'error', className, children, onClose, ...props }) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon name={alertIcons[variant]} className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 opacity-70 transition hover:opacity-100"
        >
          <Icon name="x" className="size-4" />
        </button>
      )}
    </div>
  )
}
