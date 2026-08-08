import { useMemo } from 'react'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'
import { Skeleton } from './skeleton'
import { EmptyState } from './empty-state'
import Pagination from '../Pagination'

export function DataGrid({
  columns,
  data = [],
  loading = false,
  error,
  sort,
  onSort,
  serverSort = false,
  pagination,
  onPageChange,
  emptyState = {},
  rowKey = (row) => row?._id || row?.id,
  onRowClick,
  className,
  _bodyClassName,
}) {
  const sortedData = useMemo(() => {
    if (serverSort || !sort?.key) return data
    const { key, direction } = sort
    const factor = direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = a?.[key]
      const bv = b?.[key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv)) * factor
    })
  }, [data, sort, serverSort])

  const toggleSort = (key) => {
    if (!onSort) return
    if (sort?.key === key) {
      onSort({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onSort({ key, direction: 'asc' })
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-surface', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-2/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.headerClassName,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        'group inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground',
                        sort?.key === col.key && 'text-brand-600',
                      )}
                    >
                      {col.label}
                      <Icon
                        name="chevron-down"
                        className={cn(
                          'size-3.5 transition-transform',
                          sort?.key === col.key && sort.direction === 'asc' && 'rotate-180',
                          sort?.key !== col.key && 'opacity-0 group-hover:opacity-40',
                        )}
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              Array.from({ length: Math.max(pagination?.limit || 8, 4) }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <Skeleton className={cn('h-4', col.headerClassName)} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={error ? 'triangle-alert' : (emptyState.icon || 'inbox')}
                    title={error ? 'Failed to load data' : (emptyState.title || 'No records found')}
                    message={error ? (error.message || 'Please try again.') : emptyState.message}
                    action={emptyState.action}
                    className="py-12"
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors hover:bg-surface-2/50',
                    onRowClick && 'cursor-pointer',
                    className && '',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 align-middle',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.className,
                      )}
                    >
                      {col.render ? col.render(row, i) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 0 && !loading && (
        <div className="border-t border-border-subtle bg-surface-2/40 px-4 py-3">
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}

export function SortHeader({ label, sortKey, sort, onSort, className }) {
  return (
    <button
      type="button"
      onClick={() => onSort?.({ key: sortKey, direction: sort?.direction === 'asc' ? 'desc' : 'asc' })}
      className={cn('group inline-flex items-center gap-1 uppercase tracking-wide', className)}
    >
      {label}
      <Icon
        name="chevron-down"
        className={cn(
          'size-3.5 transition-transform',
          sort?.key === sortKey && sort.direction === 'asc' && 'rotate-180',
        )}
      />
    </button>
  )
}
