import { Link } from 'react-router-dom'

export default function OnboardingChecklist({ plansCount, membersCount, activeCount }) {
  const steps = [
    { label: 'Setup gym profile & logo', done: false, to: '/setup' },
    { label: 'Create a subscription plan', done: plansCount > 0, to: '/plans' },
    { label: 'Add your first member', done: membersCount > 0, to: '/members' },
    { label: 'Track renewals & expiries', done: activeCount > 0, to: '/memberships' },
  ]
  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length
  if (allDone) return null
  const pct = Math.round((doneCount / steps.length) * 100)

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-surface p-5 shadow-card dark:border-brand-500/20 dark:from-brand-500/10 dark:to-surface">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Get your gym running
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {doneCount === 0 ? 'A few quick steps to get started.' : `${doneCount} of ${steps.length} steps done.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <Link to="/guide" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
          <span>View Step-by-Step Guide</span>
          <span>&rarr;</span>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-4">
        {steps.map((step) => (
          <Link
            key={step.label}
            to={step.to}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-medium transition ${
              step.done
                ? 'border-success-200 bg-surface text-muted-foreground dark:border-success-500/20'
                : 'border-brand-200 bg-surface text-foreground hover:border-brand-400 hover:shadow-sm dark:border-brand-500/20'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                step.done ? 'bg-success-100 text-success-600' : 'bg-brand-100 text-brand-600'
              }`}
            >
              {step.done ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </span>
            {step.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
