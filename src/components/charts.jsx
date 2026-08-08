import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatINR } from '../utils/format'
import { EmptyState } from './ui'
import { cn } from '../lib/utils'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-elevated">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold text-foreground">
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-5 text-foreground shadow-card', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

const gridStroke = 'var(--chart-grid, #e2e8f0)'
const tickFill = 'var(--chart-tick, #94a3b8)'

export function RevenueAreaChart({ data }) {
  if (!data || data.length === 0)
    return (
      <EmptyState
        title="No revenue data"
        message="Revenue will appear here once memberships are created."
        className="py-10"
      />
    )
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickFill }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: tickFill }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={60} />
        <Tooltip content={<ChartTooltip formatter={(v) => formatINR(v)} />} />
        <Area type="monotone" dataKey="totalRevenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rev)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function GrowthBarChart({ data, valueKey = 'count', xKey = 'month', color = '#6366f1', formatValue }) {
  if (!data || data.length === 0)
    return <EmptyState title="No data yet" message="Growth trends will appear here over time." className="py-10" />
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: tickFill }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: tickFill }} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip formatter={formatValue} />} cursor={{ fill: 'var(--chart-cursor, #f1f5f9)' }} />
        <Bar dataKey={valueKey} radius={[6, 6, 0, 0]} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PlanDonutChart({ data }) {
  if (!data || data.length === 0)
    return (
      <EmptyState
        title="No distribution data"
        message="Plan distribution will appear here."
        className="py-10"
      />
    )
  const total = data.reduce((sum, d) => sum + Number(d.count || 0), 0)
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="planName" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-foreground">{total}</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">members</span>
        </div>
      </div>
      <div className="w-full space-y-2">
        {data.map((d, i) => (
          <div key={d.planName} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="truncate text-muted-foreground">{d.planName}</span>
            </div>
            <span className="font-semibold text-foreground">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
