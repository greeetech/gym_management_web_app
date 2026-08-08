import { forwardRef } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'

const SelectItem = forwardRef(function SelectItem({ children, className, ...props }, ref) {
  return (
    <RadixSelect.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-md py-1.5 pl-2.5 pr-8 text-sm outline-none data-[highlighted]:bg-surface-2 data-[highlighted]:text-foreground focus:outline-none',
        className,
      )}
      {...props}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute right-2 inline-flex items-center">
        <Icon name="check" className="size-4 text-brand-600" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  )
})

export const SelectRoot = RadixSelect.Root
export const SelectValue = RadixSelect.Value

export const SelectTrigger = forwardRef(function SelectTrigger(
  { className, children, ...props },
  ref,
) {
  return (
    <RadixSelect.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1',
        className,
      )}
      {...props}
    >
      {children}
      <RadixSelect.Icon>
        <Icon name="chevron-down" className="size-4 text-muted-foreground" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  )
})

export const SelectContent = forwardRef(function SelectContent(
  { className, children, position = 'popper', ...props },
  ref,
) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        ref={ref}
        position={position}
        sideOffset={6}
        className={cn(
          'z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-surface p-1.5 text-foreground shadow-popover animate-scale-in',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]',
          className,
        )}
        {...props}
      >
        <RadixSelect.Viewport
          className={cn('p-0.5', position === 'popper' && 'w-full')}
        >
          {children}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  )
})

export { SelectItem }
