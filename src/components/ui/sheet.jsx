import * as RadixDialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  side = 'right',
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <motion.div
              className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <div
              className={cn(
                'fixed inset-0 z-50 flex',
                side === 'right' && 'justify-end',
                side === 'left' && 'justify-start',
                side === 'bottom' && 'items-end',
                side === 'top' && 'items-start',
              )}
            >
              <RadixDialog.Content forceMount asChild>
                <motion.div
                  initial={{
                    x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
                    y: side === 'top' ? '-100%' : side === 'bottom' ? '100%' : 0,
                  }}
                  animate={{ x: 0, y: 0 }}
                  exit={{
                    x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
                    y: side === 'top' ? '-100%' : side === 'bottom' ? '100%' : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                  className={cn(
                    'flex h-full w-full max-w-md flex-col border-border bg-surface text-foreground shadow-popover outline-none',
                    side === 'right' && 'border-l',
                    side === 'left' && 'border-r',
                    side === 'bottom' && 'h-auto max-h-[85vh] border-t',
                    side === 'top' && 'h-auto max-h-[85vh] border-b',
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

export const SheetTrigger = RadixDialog.Trigger
export const SheetClose = RadixDialog.Close
