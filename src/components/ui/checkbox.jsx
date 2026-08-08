import { forwardRef } from 'react'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'

export const Checkbox = forwardRef(function Checkbox({ className, ...props }, ref) {
  return (
    <RadixCheckbox.Root
      ref={ref}
      className={cn(
        'peer size-4.5 shrink-0 cursor-pointer rounded-[5px] border border-border bg-surface shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 data-[state=checked]:text-white',
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator className="flex items-center justify-center text-current">
        <Icon name="check" className="size-3.5" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
})
