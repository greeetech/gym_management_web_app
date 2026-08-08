import { forwardRef } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { cn } from '../../lib/utils'

export const TooltipProvider = RadixTooltip.Provider

export const Tooltip = RadixTooltip.Root
export const TooltipTrigger = RadixTooltip.Trigger

export const TooltipContent = forwardRef(function TooltipContent(
  { className, sideOffset = 6, ...props },
  ref,
) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 max-w-64 rounded-lg border border-border bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-popover animate-scale-in',
          className,
        )}
        {...props}
      />
    </RadixTooltip.Portal>
  )
})
