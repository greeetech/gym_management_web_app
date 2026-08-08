import { cn } from '../../lib/utils'
import { Icon } from '../icons'

export function EmptyState({ message, title = 'Nothing here yet', action, icon, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-gradient-soft text-brand-500 dark:text-brand-400">
        <Icon name={icon || 'inbox'} className="size-8" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
