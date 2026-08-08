import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700',
        secondary:
          'border border-border bg-surface text-foreground shadow-sm hover:bg-surface-2 hover:border-border',
        outline: 'border border-border bg-transparent text-foreground hover:bg-surface-2',
        ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
        danger: 'bg-danger-600 text-white shadow-sm shadow-danger-600/20 hover:bg-danger-700',
        success: 'bg-success-600 text-white shadow-sm shadow-success-600/20 hover:bg-success-700',
        'gradient-primary': 'bg-brand-gradient text-white shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/30',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-sm',
        icon: 'size-9 p-0',
        'icon-sm': 'size-8 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export const Button = forwardRef(function Button(
  { className, variant, size, loading, icon, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading || props.disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loading === true ? children : loading}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
})
