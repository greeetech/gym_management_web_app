import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Label = forwardRef(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
})

export function Field({ label, error, hint, required, children, htmlFor, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-danger-500">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
    </div>
  )
}
