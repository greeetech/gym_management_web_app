import { forwardRef } from 'react'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/utils'

export const DropdownMenu = RadixDropdown.Root
export const DropdownMenuTrigger = RadixDropdown.Trigger
export const DropdownMenuGroup = RadixDropdown.Group
export const DropdownMenuSeparator = RadixDropdown.Separator

export const DropdownMenuContent = forwardRef(function DropdownMenuContent(
  { className, sideOffset = 6, ...props },
  ref,
) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-52 overflow-hidden rounded-xl border border-border bg-surface p-1.5 text-foreground shadow-popover animate-scale-in',
          className,
        )}
        {...props}
      />
    </RadixDropdown.Portal>
  )
})

export const DropdownMenuItem = forwardRef(function DropdownMenuItem(
  { className, inset, variant, ...props },
  ref,
) {
  return (
    <RadixDropdown.Item
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors focus:bg-surface-2 focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        inset && 'pl-8',
        variant === 'danger' && 'text-danger-600 focus:bg-danger-50 focus:text-danger-700 dark:focus:bg-danger-500/10',
        className,
      )}
      {...props}
    />
  )
})

export const DropdownMenuLabel = forwardRef(function DropdownMenuLabel(
  { className, inset, ...props },
  ref,
) {
  return (
    <RadixDropdown.Label
      ref={ref}
      className={cn('px-2.5 py-1.5 text-xs font-semibold text-muted-foreground', inset && 'pl-8', className)}
      {...props}
    />
  )
})

export const DropdownMenuSub = RadixDropdown.Sub
export const DropdownMenuSubTrigger = forwardRef(function DropdownMenuSubTrigger(
  { className, inset, children, ...props },
  ref,
) {
  return (
    <RadixDropdown.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors focus:bg-surface-2 data-[state=open]:bg-surface-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <span className="ml-auto">›</span>
    </RadixDropdown.SubTrigger>
  )
})

export const DropdownMenuSubContent = forwardRef(function DropdownMenuSubContent(
  { className, ...props },
  ref,
) {
  return (
    <RadixDropdown.SubContent
      ref={ref}
      className={cn(
        'z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-surface p-1.5 text-foreground shadow-popover animate-scale-in',
        className,
      )}
      {...props}
    />
  )
})
