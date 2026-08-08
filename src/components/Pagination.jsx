import { cn } from '../lib/utils'
import { Icon } from './icons'

function getPageWindow(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

export default function Pagination({ page, totalPages, onPageChange, total, pageSize, className }) {
  if (totalPages <= 1) return null

  const start = total ? (page - 1) * pageSize + 1 : null
  const end = total ? Math.min(page * pageSize, total) : null
  const window = getPageWindow(page, totalPages)

  const btn =
    'inline-flex size-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {total !== undefined && pageSize ? (
          <>
            Showing <span className="font-semibold text-foreground">{start}</span>–
            <span className="font-semibold text-foreground">{end}</span> of{' '}
            <span className="font-semibold text-foreground">{total}</span>
          </>
        ) : (
          <>
            Page <span className="font-semibold text-foreground">{page}</span> of{' '}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </>
        )}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className={btn}
        >
          <Icon name="chevron-left" className="size-4" />
        </button>
        {window.map((item, i) =>
          item === 'ellipsis' ? (
            <span key={`e${i}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'h-8 min-w-8 rounded-lg px-2 text-sm font-semibold transition',
                item === page
                  ? 'bg-brand-gradient text-white shadow-md shadow-brand-600/25'
                  : 'border border-border bg-surface text-muted-foreground hover:bg-surface-2 hover:text-foreground',
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className={btn}
        >
          <Icon name="chevron-right" className="size-4" />
        </button>
      </div>
    </div>
  )
}
