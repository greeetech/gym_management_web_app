import { forwardRef } from 'react'
import * as RadixSwitch from '@radix-ui/react-switch'
import { cn } from '../../lib/utils'

export const Switch = forwardRef(function Switch({ className, ...props }, ref) {
  return (
    <RadixSwitch.Root
      ref={ref}
      className={cn(
        'peer inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-surface-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-600',
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          'pointer-events-none block size-4.5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4.5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </RadixSwitch.Root>
  )
})
