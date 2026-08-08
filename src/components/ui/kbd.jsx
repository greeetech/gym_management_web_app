import { cn } from '../../lib/utils'

export function Kbd({ className, children }) {
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-border bg-surface-2 px-1.5 font-sans text-[10px] font-semibold text-muted-foreground',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
