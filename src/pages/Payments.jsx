import { useState } from 'react'
import api, { getErrorMessage } from '../services/api'
import { usePayments, usePaymentPlans } from '../hooks/useQueries'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import { useToast } from '../components/Toast'
import StatusBadge from '../components/StatusBadge'
import { Alert, Button, DataGrid, EmptyState, PageHeader } from '../components/ui'
import { Icon } from '../components/icons'
import { formatDate, formatINR } from '../utils/format'
import { exportRowsToCSV } from '../utils/csv'

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

  const [billingCycle, setBillingCycle] = useState({})
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState(null)

  const plans = plansQuery.data || []
  const history = historyQuery.data?.data || { items: [], pagination: { page: 1, totalPages: 1 } }

  const handlePurchase = async (plan) => {
    const cycle = billingCycle[plan._id] || 'monthly'
    setProcessingId(plan._id)
    setError(null)
    try {
      const orderRes = await api.post('/payment/create-payment', {
        planId: plan._id,
        billingCycle: cycle,
      })
      const order = orderRes.data.data

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
    <div>
      <PageHeader
        title="Billing & Plans"
        subtitle="Upgrade your gym plan and view your payment history"
        breadcrumb="Billing"
      />

      {error && (
        <div className="mb-6">
          <Alert onClose={() => setError(null)}>{error}</Alert>
        </div>
      )}

      {plansQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl border border-border bg-surface-2" />
          ))}
        </div>
      ) : plansQuery.error ? (
        <Alert>{plansQuery.error.message}</Alert>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface shadow-card">
          <EmptyState title="No plans available" message="No plans are available right now. Check back later." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const monthly = plan.pricing?.monthly
            const yearly = plan.pricing?.yearly
            const cycle = billingCycle[plan._id] || 'monthly'
            const activePrice = cycle === 'yearly' && yearly ? yearly.price : monthly?.price
            const unlimited = monthly?.isUnlimited
            return (
              <div
                key={plan._id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-card transition hover:-translate-y-1 hover:shadow-elevated ${
                  plan.highlight ? 'border-brand-600 ring-2 ring-brand-600/40' : 'border-border'
                }`}
              >
                <div className={`px-6 pb-5 pt-7 ${plan.highlight ? 'bg-gradient-to-br from-brand-600 to-brand-800' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
                  {plan.tag && (
                    <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                      {plan.tag}
                    </span>
                  )}
                  <h3 className="text-xl font-extrabold text-white">{plan.displayName || plan.name}</h3>
                  <p className="mt-1 text-sm text-white/70">{plan.description}</p>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                      {formatINR(activePrice || 0)}
                    </span>
                    <span className="text-sm text-muted-foreground">/{cycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                  {cycle === 'yearly' && yearly?.discountPercentage > 0 && (
                    <p className="mt-1.5 text-xs font-semibold text-success-600">
                      Save {yearly.discountPercentage}% vs monthly
                    </p>
                  )}

                  <div className="my-5 inline-flex w-fit rounded-xl border border-border bg-surface p-1">
                    {[
                      { key: 'monthly', label: 'Monthly' },
                      { key: 'yearly', label: 'Yearly' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setBillingCycle((c) => ({ ...c, [plan._id]: opt.key }))}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
                          cycle === opt.key
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-muted-foreground hover:bg-surface-2'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <ul className="flex-1 space-y-2.5">
                    {(plan.features || []).map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-600">
                          <Icon name="check" className="size-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => handlePurchase(plan)}
                      disabled={processingId === plan._id || !monthly?.price}
                      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-brand-600 to-brand-700 shadow-lg shadow-brand-600/30 hover:from-brand-700 hover:to-brand-800'
                          : 'bg-foreground text-background hover:opacity-90'
                      }`}
                    >
                      {processingId === plan._id ? 'Processing...' : `Choose ${plan.displayName || plan.name}`}
                    </button>
                    <p className="mt-2.5 text-center text-xs text-muted-foreground">
                      {unlimited ? 'Unlimited members' : `Up to ${monthly?.memberLimit ?? 100} members`}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Payment History</h2>
            <p className="text-sm text-muted-foreground">Your subscription and payment records</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={history.items.length === 0}
          >
            <Icon name="download" className="size-4" />
            Export
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
            title: 'No payments yet',
            message: 'Your payment history will appear here after you subscribe.',
          }}
        />
      </div>
    </div>
  )
}
