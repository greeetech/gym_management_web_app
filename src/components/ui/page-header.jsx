import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Icon } from '../icons'

export function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <div key={item.label} className="flex items-center gap-1.5">
            {i > 0 && (
              <Icon name="chevron-right" className="size-3.5 text-muted-foreground/60" />
            )}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'font-semibold text-foreground',
                  isLast && 'pointer-events-none',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
  icon,
  breadcrumbs,
  className,
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand-500/25">
            <Icon name={icon} className="size-5" />
          </div>
        )}
        <div>
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-1.5" />}
          {breadcrumb && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {breadcrumb}
            </p>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  )
}
