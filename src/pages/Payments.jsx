import { useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import { usePayments, usePaymentPlans } from '../hooks/useQueries'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import { useToast } from '../components/Toast'
import StatusBadge from '../components/StatusBadge'
import PricingPlanCard from '../components/PricingPlanCard'
import { Alert, Button, DataGrid, EmptyState, PageHeader, Card, Badge } from '../components/ui'
import { Icon } from '../components/icons'
import { formatDate, formatINR, daysUntil } from '../utils/format'
import { exportRowsToCSV } from '../utils/csv'
import { cn } from '../lib/utils'

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'))
    document.body.appendChild(script)
  })
}

const HISTORY_COLUMNS = [
  { label: 'Plan', value: (s) => s.planSnapshot?.displayName || s.planSnapshot?.name || '' },
  { label: 'Billing', value: (s) => s.billingCycle || '' },
  { label: 'Amount', value: (s) => s.amount || '' },
  { label: 'Status', value: (s) => s.status || '' },
  { label: 'Payment', value: (s) => s.paymentStatus || '' },
  { label: 'End Date', value: (s) => s.endDate || '' },
]

export default function Payments() {
  const toast = useToast()
  const subscription = useOwnerSubscription()
  const plansQuery = usePaymentPlans()

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const historyQuery = usePayments({ page, limit })

  const [globalBillingCycle, setGlobalBillingCycle] = useState('monthly')
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState(null)

  const plans = plansQuery.data || []
  const history = historyQuery.data?.data || { items: [], pagination: { page: 1, totalPages: 1 } }

  const activeSub = subscription?.active || null
  const activePlanName = (activeSub?.planSnapshot?.name || '').toLowerCase()
  const activePlanId = activeSub?.planId ? String(activeSub.planId) : null

  const handlePurchase = async (plan) => {
    const cycle = globalBillingCycle || 'monthly'
    setProcessingId(plan._id)
    setError(null)
    try {
      const orderRes = await api.post('/payment/create-payment', {
        planId: plan._id,
        billingCycle: cycle,
      })
      const order = orderRes.data.data

      if (order.keyId === 'rzp_test_replace_me' || (order.orderId && order.orderId.startsWith('order_dummy_'))) {
        toast.success('Test Mode: Simulating Payment Success')
        await api.post('/payment/verify-payment', {
          subscriptionId: order.subscriptionId,
          razorpay_order_id: order.orderId,
          razorpay_payment_id: 'pay_dummy_' + Date.now(),
          razorpay_signature: 'dummy_signature',
        })
        if (subscription?.refresh) subscription.refresh()
        if (historyQuery?.refetch) historyQuery.refetch()
        setProcessingId(null)
        return
      }

      await loadRazorpayScript()

      const result = await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Gym Manager',
          description: `${order.plan?.displayName || order.plan?.name} (${cycle})`,
          order_id: order.orderId,
          handler: (response) => resolve(response),
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        })
        razorpay.on('payment.failed', (res) =>
          reject(new Error(res.error?.description || 'Payment failed')),
        )
        razorpay.open()
      })

      await api.post('/payment/verify-payment', {
        subscriptionId: order.subscriptionId,
        razorpay_order_id: result.razorpay_order_id,
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_signature: result.razorpay_signature,
      })

      toast.success('Payment verified. Your subscription is now active.')
      historyQuery.refetch()
      subscription.refresh()
    } catch (err) {
      if (err.message === 'Payment cancelled' || err.message === 'Payment failed') {
        setError(err.message)
      } else {
        setError(getErrorMessage(err, 'Payment failed'))
      }
    } finally {
      setProcessingId(null)
    }
  }

  const handleExport = () => {
    exportRowsToCSV('billing_history.csv', history.items, HISTORY_COLUMNS)
    toast.success('History exported to CSV')
  }

  const historyColumns = [
    {
      key: 'planSnapshot',
      label: 'Plan',
      render: (s) => (
        <span className="font-semibold text-foreground">
          {s.planSnapshot?.displayName || s.planSnapshot?.name || '—'}
        </span>
      ),
    },
    {
      key: 'billingCycle',
      label: 'Billing',
      render: (s) => <span className="capitalize text-muted-foreground">{s.billingCycle}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (s) => <span className="font-medium text-foreground tabular-nums">{formatINR(s.amount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (s) => <StatusBadge status={s.paymentStatus} />,
    },
    {
      key: 'endDate',
      label: 'Valid Till',
      render: (s) => <span className="text-muted-foreground tabular-nums">{formatDate(s.endDate)}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (s) => <span className="text-muted-foreground tabular-nums">{formatDate(s.createdAt)}</span>,
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your SaaS plan, member quotas, and view verified payment receipts"
        breadcrumb="Billing"
      />

      {error && (
        <Alert onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* Active Subscription Overview Card */}
      {activeSub && (
        <Card className="p-6 border-brand-500/30 bg-gradient-to-r from-brand-500/[0.06] via-surface to-surface shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md shadow-brand-500/25">
                <Icon name="shield" className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">
                    {activeSub.planSnapshot?.displayName || activeSub.planSnapshot?.name}
                  </h3>
                  <Badge variant="success" dot className="text-[11px] font-semibold">
                    Active Subscription
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Billed {activeSub.billingCycle} · Renewal date:{' '}
                  <strong className="text-foreground">{formatDate(activeSub.endDate)}</strong>
                  {daysUntil(activeSub.endDate) !== null && (
                    <span className="ml-1 text-brand-600 dark:text-brand-400 font-medium">
                      ({daysUntil(activeSub.endDate)} days remaining)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="rounded-xl border border-border bg-surface-2/60 px-4 py-2">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Member Limit
                </span>
                <span className="font-extrabold text-foreground text-sm">
                  {activeSub.isUnlimited || activeSub.memberLimit == null
                    ? 'Unlimited'
                    : `${activeSub.currentMemberCount || 0} / ${activeSub.memberLimit}`}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Billing Switcher (Global Frequency Toggle) */}
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="inline-flex items-center rounded-2xl border border-border bg-surface p-1.5 shadow-xs">
          <button
            type="button"
            onClick={() => setGlobalBillingCycle('monthly')}
            className={cn(
              'rounded-xl px-5 py-2 text-sm font-semibold transition-all cursor-pointer',
              globalBillingCycle === 'monthly'
                ? 'bg-brand-gradient text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setGlobalBillingCycle('yearly')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all cursor-pointer',
              globalBillingCycle === 'yearly'
                ? 'bg-brand-gradient text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span>Yearly Billing</span>
            <span className="rounded-full bg-success-500/15 px-2.5 py-0.5 text-xs font-bold text-success-600 dark:text-success-400">
              Save up to 25%
            </span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Upgrade or switch your tier anytime with instant prorated member limits.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      {plansQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-3xl border border-border bg-surface-2" />
          ))}
        </div>
      ) : plansQuery.error ? (
        <Alert>{plansQuery.error.message}</Alert>
      ) : plans.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            title="No subscription plans available"
            message="No active SaaS plans are configured right now. Please check back shortly."
          />
        </Card>
      ) : (
        <div
          className={cn(
            'grid grid-cols-1 gap-6',
            plans.length === 1 && 'max-w-md mx-auto',
            plans.length === 2 && 'md:grid-cols-2 max-w-4xl mx-auto',
            plans.length >= 3 && 'md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto',
          )}
        >
          {plans.map((plan) => {
            const isCurrent =
              Boolean(activePlanId && String(activePlanId) === String(plan._id)) ||
              Boolean(
                activePlanName &&
                  (activePlanName === plan.name?.toLowerCase() ||
                    activePlanName === plan.displayName?.toLowerCase()),
              )

            return (
              <PricingPlanCard
                key={plan._id}
                plan={plan}
                billingCycle={globalBillingCycle}
                isCurrentPlan={isCurrent}
                processing={processingId === plan._id}
                onSelect={handlePurchase}
              />
            )
          })}
        </div>
      )}

      {/* Payment History Section */}
      <div className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Payment History & Invoices</h2>
            <p className="text-xs text-muted-foreground">
              Official records of all subscription activations and Razorpay transactions
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={history.items.length === 0}
          >
            <Icon name="download" className="size-4" />
            Export CSV
          </Button>
        </div>

        <DataGrid
          columns={historyColumns}
          data={history.items}
          loading={historyQuery.isLoading && !history.items.length}
          error={historyQuery.error}
          rowKey={(s) => s._id}
          pagination={history.pagination}
          onPageChange={setPage}
          emptyState={{
            title: 'No payments recorded',
            message: 'Your payment history will appear here after you activate your subscription.',
          }}
        />
      </div>
    </div>
  )
}