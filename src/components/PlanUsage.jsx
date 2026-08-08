import { Link } from 'react-router-dom'
import { formatDate, daysUntil } from '../utils/format'
import StatusBadge from './StatusBadge'
import { Icon } from './icons'

function UsageBar({ used, limit }) {
  const pct = limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const nearLimit = pct >= 80
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Members</span>
        <span className="font-medium text-muted-foreground">
          {used}
          {limit ? ` / ${limit}` : ''}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className={`h-full rounded-full transition-all ${nearLimit ? 'bg-danger-gradient' : 'bg-success-gradient'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {nearLimit && <p className="mt-1.5 text-[11px] font-medium text-danger-600">Almost at your member limit</p>}
    </div>
  )
}

export function PlanBadge({ sub }) {
  return (
    <div className="mb-1 flex items-center justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {sub?.planSnapshot?.displayName || sub?.planSnapshot?.name || 'Free'}
        </p>
        {sub?.planSnapshot?.name && (
          <p className="truncate text-[11px] capitalize text-muted-foreground">
            {sub.billingCycle} · {formatDate(sub.endDate)}
          </p>
        )}
      </div>
      <StatusBadge status={sub?.status || 'no-sub'} dot={false} />
    </div>
  )
}

export function PlanUsageCard({ sub, compact = false, collapsed = false }) {
  const limit = sub?.isUnlimited || sub?.memberLimit == null ? null : sub.memberLimit
  const used = sub?.currentMemberCount || 0
  const days = daysUntil(sub?.endDate)

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md">
          <Icon name="wallet" className="size-4" />
        </div>
        <Link
          to="/billing"
          title="Manage plan"
          aria-label="Manage plan"
          className="rounded-lg p-1.5 text-sidebar-muted transition hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
        >
          <Icon name="settings" className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-foreground shadow-card">
      {sub ? (
        <>
          <PlanBadge sub={sub} />
          <div className="mt-3">
            {limit === null ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">{used} members</span>
              </div>
            ) : (
              <UsageBar used={used} limit={limit} />
            )}
          </div>
          {days !== null && days <= 14 && days >= 0 && (
            <p className="mt-3 rounded-lg bg-warning-50 px-3 py-2 text-[11px] font-medium text-warning-700">
              Expires in {days} day{days === 1 ? '' : 's'}
            </p>
          )}
          {!compact && (
            <Link
              to="/billing"
              className="mt-3 block rounded-lg bg-brand-gradient px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Manage plan
            </Link>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-semibold">Free plan</p>
          <p className="mt-1 text-xs text-muted-foreground">Up to 100 members for free.</p>
          <Link
            to="/billing"
            className="mt-3 block rounded-lg bg-brand-gradient px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Upgrade
          </Link>
        </>
      )}
    </div>
  )
}
