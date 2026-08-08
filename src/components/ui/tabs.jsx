import { forwardRef } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '../../lib/utils'

export const Tabs = RadixTabs.Root
export const TabsList = RadixTabs.List

export const TabsTrigger = forwardRef(function TabsTrigger({ className, ...props }, ref) {
  return (
    <RadixTabs.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  )
})

export const TabsContent = forwardRef(function TabsContent({ className, ...props }, ref) {
  return (
    <RadixTabs.Content
      ref={ref}
      className={cn('mt-4 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60', className)}
      {...props}
    />
  )
})

export function TabButtons({ options, value, onChange, className }) {
  return (
    <div className={cn('inline-flex items-center rounded-lg bg-surface-2 p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60',
            value === opt.value
              ? 'bg-brand-gradient text-white shadow-sm'
              : 'text-muted-foreground hover:bg-surface hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
