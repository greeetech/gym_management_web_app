import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAnalytics, useMembers, useMembershipStatusCounts, usePlans } from '../hooks/useQueries'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { CardSkeleton, TableSkeleton, ChartSkeleton } from '../components/Skeleton'
import { ChartCard, GrowthBarChart, PlanDonutChart, RevenueAreaChart } from '../components/charts'
import OnboardingChecklist from '../components/OnboardingChecklist'
import SetupBanner from '../components/SetupBanner'
import { Alert, EmptyState } from '../components/ui'
import { Icon } from '../components/icons'
import { formatDate, formatINR, initials, daysUntil } from '../utils/format'

function Greeting() {
  const hour = new Date().getHours()
  const period = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return period
}

function HeroCard({ user, sub }) {
  const limit = sub?.isUnlimited || sub?.memberLimit == null ? null : sub.memberLimit
  const used = sub?.currentMemberCount || 0
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-6 shadow-lg sm:p-8">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="absolute -bottom-20 right-24 h-52 w-52 rounded-full bg-violet-500/30 blur-3xl" />
      <div className="absolute left-1/4 top-1/3 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="relative">
        <p className="text-sm font-medium text-brand-200">{Greeting()},</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Here&apos;s what&apos;s happening at your gym today. Stay on top of members, renewals and revenue.
        </p>

        {sub && (
          <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/40 text-brand-200">
              <Icon name="credit-card" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {sub.planSnapshot?.displayName || sub.planSnapshot?.name || 'Free'} plan
                <span className="ml-2 text-xs font-medium text-slate-400">
                  {limit ? `${used} / ${limit} members` : `${used} members · unlimited`}
                </span>
              </p>
              {limit && pct >= 80 && (
                <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-red-400" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
            <Link
              to="/billing"
              className="rounded-lg bg-brand-gradient px-3.5 py-2 text-xs font-semibold text-white transition hover:shadow-lg hover:shadow-brand-500/30"
            >
              Manage plan
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function PlanInactiveBanner({ sub }) {
  const hasHistory = (sub?.items?.length || 0) > 0
  const isActive = !!sub?.active
  if (!hasHistory || isActive) return null
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
          <Icon name="triangle-alert" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-danger-800">Your plan is no longer active</p>
          <p className="text-sm text-danger-600">
            Renew your subscription to keep adding members and keep your member limit at {sub?.memberLimit ?? 100}.
          </p>
        </div>
      </div>
      <Link
        to="/billing"
        className="shrink-0 rounded-lg bg-danger-gradient px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Renew plan
      </Link>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const analytics = useAnalytics()
  const recentQuery = useMembers({ limit: 5 })
  const expiringQuery = useMembers({ limit: 10, expiresIn: 7 })
  const statusCounts = useMembershipStatusCounts()
  const plansQuery = usePlans()
  const sub = useOwnerSubscription()

  const d = analytics.data?.data || {}
  const recent = recentQuery.data?.data || []
  const expiring = expiringQuery.data?.data || []
  const statusMap = statusCounts.data?.data || {}
  const plansCount = plansQuery.data?.length || 0

  const expiringIn7 = expiringQuery.data?.pagination?.total ?? expiring.length

  const stats = [
    { label: 'Total Members', value: d.totalGymMembers ?? 0, accent: 'brand', icon: 'users' },
    { label: 'Active Memberships', value: d.totalActiveMemberships ?? 0, accent: 'green', icon: 'shield' },
    { label: 'Total Revenue', value: formatINR(d.totalRevenueGenerated), accent: 'violet', icon: 'currency' },
    {
      label: 'Expiring in 7 days',
      value: expiringIn7,
      accent: 'orange',
      icon: 'clock',
      sub: 'Memberships nearing renewal',
      to: '/members?expiresIn=7',
    },
  ]

  const loading = analytics.isLoading

  return (
    <div className="space-y-6">
      <HeroCard user={user} sub={sub.current} />
      <PlanInactiveBanner sub={sub} />
      <SetupBanner />

      <OnboardingChecklist
        plansCount={plansCount}
        membersCount={d.totalGymMembers ?? 0}
        activeCount={d.totalActiveMemberships ?? statusMap.Active ?? 0}
      />

      {analytics.error && <Alert>{analytics.error.message}</Alert>}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartSkeleton className="lg:col-span-2" />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Revenue Generated" subtitle="Monthly revenue from memberships" className="lg:col-span-2">
            <RevenueAreaChart data={d.revenueGeneratedMonthly || []} />
          </ChartCard>
          <ChartCard title="Members by Plan" subtitle="Distribution across your plans">
            <PlanDonutChart data={d.membershipDistributionByPlans || []} />
          </ChartCard>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Membership Growth" subtitle="New memberships per month">
            <GrowthBarChart data={d.membershipGrowthOverTime || []} />
          </ChartCard>
          <ChartCard title="New Members" subtitle="Members joining each month">
            <GrowthBarChart data={d.newMembersEntryMonthly || []} color="#10b981" />
          </ChartCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <div>
              <h3 className="text-sm font-bold">Recent Members</h3>
              <p className="text-xs text-muted-foreground">Latest members added</p>
            </div>
            <Link to="/members" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {recentQuery.isLoading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : recent.length === 0 ? (
            <EmptyState title="No members yet" message="Add your first member to get started." action={<Link to="/members" className="rounded-lg bg-brand-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90">Add member</Link>} />
          ) : (
            <div className="divide-y divide-border-subtle">
              {recent.map((m) => (
                <Link key={m._id} to={`/members/${m._id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-surface-2/50">
                  {m.profileImage?.url ? (
                    <img src={m.profileImage.url} alt={m.fullName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                      {initials(m.fullName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground tabular-nums">{m.phone}</p>
                  </div>
                  <StatusBadge status={m.membershipId?.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-card">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <div>
              <h3 className="text-sm font-bold">Expiring in 7 Days</h3>
              <p className="text-xs text-muted-foreground">Memberships nearing renewal</p>
            </div>
            <Link to="/members?expiresIn=7" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          {expiringQuery.isLoading ? (
            <TableSkeleton rows={4} cols={3} />
          ) : expiring.length === 0 ? (
            <EmptyState title="All caught up" message="No memberships expiring in the next few days." />
          ) : (
            <div className="divide-y divide-border-subtle">
              {expiring.slice(0, 6).map((m) => {
                const days = daysUntil(m.membershipId?.endDate)
                return (
                  <Link key={m._id} to={`/members/${m._id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-surface-2/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-50 text-warning-600">
                      <Icon name="clock" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{m.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground tabular-nums">Ends {formatDate(m.membershipId?.endDate)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${days !== null && days <= 3 ? 'bg-danger-50 text-danger-700' : 'bg-warning-50 text-warning-700'}`}>
                      {days !== null ? `${days}d left` : '—'}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
