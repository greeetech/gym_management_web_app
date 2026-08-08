import { forwardRef } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const contentVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 32 } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.15 } },
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = 'md',
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <motion.div
              className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            />
            <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
              <RadixDialog.Content forceMount asChild>
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={cn(
                    'relative w-full rounded-2xl border border-border bg-surface text-foreground shadow-popover outline-none',
                    {
                      sm: 'max-w-md',
                      md: 'max-w-lg',
                      lg: 'max-w-2xl',
                      xl: 'max-w-4xl',
                    }[size],
                    className,
                  )}
                >
                  {title && (
                    <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
                      <div>
                        <RadixDialog.Title className="text-base font-bold text-foreground">
                          {title}
                        </RadixDialog.Title>
                        {description && (
                          <RadixDialog.Description className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                          </RadixDialog.Description>
                        )}
                      </div>
                      <RadixDialog.Close asChild>
                        <button
                          type="button"
                          aria-label="Close"
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
                        >
                          <Icon name="x" className="size-5" />
                        </button>
                      </RadixDialog.Close>
                    </div>
                  )}
                  {children}
                </motion.div>
              </RadixDialog.Content>
            </div>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  )
}

export const DialogTrigger = RadixDialog.Trigger
export const DialogClose = RadixDialog.Close

export function ModalBody({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

export function ModalFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-end gap-3 border-t border-border-subtle px-5 py-4', className)}
      {...props}
    />
  )
}

export const DialogTitle = forwardRef(function DialogTitle({ className, ...props }, ref) {
  return <RadixDialog.Title ref={ref} className={cn('text-base font-bold', className)} {...props} />
})

export const DialogDescription = forwardRef(function DialogDescription(
  { className, ...props },
  ref,
) {
  return (
    <RadixDialog.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
