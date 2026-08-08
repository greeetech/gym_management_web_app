import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
  return <div className={cn('shimmer rounded-lg', className)} {...props} />
}
