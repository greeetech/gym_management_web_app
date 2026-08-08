import { forwardRef } from 'react'
import * as RadixAvatar from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'
import { initials } from '../../utils/format'

export const Avatar = forwardRef(function Avatar(
  { src, alt = '', name, className, ...props },
  ref,
) {
  return (
    <RadixAvatar.Root
      ref={ref}
      className={cn(
        'relative flex size-10 shrink-0 overflow-hidden rounded-full bg-brand-gradient text-white select-none',
        className,
      )}
      {...props}
    >
      {src && (
        <RadixAvatar.Image src={src} alt={alt} className="h-full w-full object-cover" />
      )}
      <RadixAvatar.Fallback className="flex h-full w-full items-center justify-center text-sm font-bold">
        {initials(name || alt)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
})
