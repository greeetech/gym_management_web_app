import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const inputClass = (hasError, className = '') =>
  cn(
    'flex h-10 w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50',
    hasError
      ? 'border-danger-500 focus:border-danger-500'
      : 'border-border focus:border-brand-500',
    className,
  )

export const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return <input ref={ref} className={inputClass(invalid, className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputClass(invalid, className), 'h-auto min-h-24 py-2.5')}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select({ className, invalid, ...props }, ref) {
  return <select ref={ref} className={cn(inputClass(invalid, className), 'cursor-pointer pr-8')} {...props} />
})
