import { useAnalytics } from '../hooks/useQueries'
import StatCard from '../components/StatCard'
import { ChartSkeleton } from '../components/Skeleton'
import { ChartCard, GrowthBarChart, PlanDonutChart, RevenueAreaChart } from '../components/charts'
import { Alert, PageHeader } from '../components/ui'
import { formatINR } from '../utils/format'

export default function Analytics() {
  const { data, isLoading, error } = useAnalytics()

  const d = data?.data || {}

  const statusCards = [
    { label: 'Total Members', value: d.totalGymMembers ?? 0, accent: 'brand', icon: 'users' },
    { label: 'Active', value: d.totalActiveMemberships ?? 0, accent: 'green', icon: 'check-circle' },
    { label: 'Inactive', value: d.totalInactiveMemberships ?? 0, accent: 'slate', icon: 'user' },
    { label: 'Cancelled', value: d.totalCancelledMemberships ?? 0, accent: 'red', icon: 'x' },
  ]

  const revenueCards = [
    { label: 'Total Revenue', value: formatINR(d.totalRevenueGenerated), accent: 'green', icon: 'currency' },
    { label: 'Revenue (Active)', value: formatINR(d.totalRevenueActiveMemberships), accent: 'brand', icon: 'check-circle' },
    { label: 'Revenue (Inactive)', value: formatINR(d.totalRevenueInactiveMemberships), accent: 'slate', icon: 'user' },
    { label: 'Revenue (Cancelled)', value: formatINR(d.totalRevenueCancelledMemberships), accent: 'red', icon: 'x' },
  ]

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Detailed insights into your gym's performance" breadcrumb="Overview" />

      {error && <Alert>{error.message}</Alert>}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} className="h-28" />)}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartSkeleton className="lg:col-span-2" />
            <ChartSkeleton />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statusCards.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {revenueCards.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChartCard title="Revenue Generated" subtitle="Monthly revenue trend" className="lg:col-span-2">
              <RevenueAreaChart data={d.revenueGeneratedMonthly || []} />
            </ChartCard>
            <ChartCard title="Members by Plan" subtitle="Plan distribution">
              <PlanDonutChart data={d.membershipDistributionByPlans || []} />
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Membership Growth" subtitle="New memberships per month">
              <GrowthBarChart data={d.membershipGrowthOverTime || []} />
            </ChartCard>
            <ChartCard title="New Members (monthly)" subtitle="Members added each month">
              <GrowthBarChart data={d.newMembersEntryMonthly || []} color="#10b981" />
            </ChartCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Revenue (yearly)" subtitle="Yearly revenue generated">
              <GrowthBarChart data={d.revenueGeneratedYearly || []} xKey="year" valueKey="totalRevenue" formatValue={(v) => formatINR(v)} />
            </ChartCard>
            <ChartCard title="New Members (yearly)" subtitle="Members added per year">
              <GrowthBarChart data={d.newMembersEntryYearly || []} xKey="year" valueKey="count" color="#8b5cf6" />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
