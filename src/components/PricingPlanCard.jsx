import { Card, Badge, Button } from './ui'
import { Icon } from './icons'
import { formatINR } from '../utils/format'
import { cn } from '../lib/utils'

export default function PricingPlanCard({
  plan,
  billingCycle = 'monthly',
  isCurrentPlan = false,
  processing = false,
  onSelect,
}) {
  const monthly = plan?.pricing?.monthly
  const yearly = plan?.pricing?.yearly
  const isYearly = billingCycle === 'yearly'
  const activePrice = isYearly && yearly?.price ? yearly.price : monthly?.price
  const unlimited = !!monthly?.isUnlimited
  const memberLimit = monthly?.memberLimit

  return (
    <Card
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-200 backdrop-blur-xl',
        plan.highlight
          ? 'border-brand-500/60 ring-2 ring-brand-500/20 shadow-elevated bg-gradient-to-b from-brand-500/[0.04] via-surface to-surface hover:-translate-y-1'
          : 'border-border bg-surface shadow-card hover:border-border-strong hover:shadow-elevated hover:-translate-y-1',
        isCurrentPlan && 'border-success-500/50 ring-2 ring-success-500/20',
      )}
    >
      <div>
        {/* Top Badges / Tag Row (Always visible and never clipped) */}
        <div className="flex items-center justify-between gap-2 min-h-[28px] mb-3">
          {isCurrentPlan ? (
            <Badge variant="success" dot className="text-xs font-semibold px-2.5 py-1">
              Current Active Plan
            </Badge>
          ) : plan.tag ? (
            <Badge
              variant={plan.highlight ? 'default' : 'neutral'}
              className={cn(
                'text-[11px] font-bold uppercase tracking-wider px-2.5 py-1',
                plan.highlight && 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 shadow-xs',
              )}
            >
              <Icon name="sparkles" className="size-3 mr-1" />
              {plan.tag}
            </Badge>
          ) : (
            <span />
          )}

          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              unlimited
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                : 'bg-surface-2 text-muted-foreground border border-border/50',
            )}
          >
            <Icon name="users" className="size-3" />
            {unlimited ? 'Unlimited' : `Up to ${memberLimit ?? 100} members`}
          </span>
        </div>

        {/* Plan Title & Description */}
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">
            {plan.displayName || plan.name}
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed min-h-[34px] line-clamp-2">
            {plan.description || 'Full-featured gym management and growth system.'}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="my-5 rounded-2xl border border-border/60 bg-surface-2/60 p-4 transition-colors">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-foreground sm:text-4xl tabular-nums">
              {formatINR(activePrice || 0)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              /{isYearly ? 'year' : 'month'}
            </span>
          </div>

          {isYearly && yearly ? (
            <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
              <span className="text-muted-foreground font-medium">
                {formatINR(yearly.perMonthPrice || Math.round((yearly.price || 0) / 12))}/mo billed yearly
              </span>
              {yearly.discountPercentage > 0 && (
                <span className="rounded-md bg-success-500/10 px-2 py-0.5 font-bold text-success-600 dark:text-success-400">
                  Save {yearly.discountPercentage}%
                </span>
              )}
            </div>
          ) : (
            <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
              Monthly flexible billing · Cancel anytime
            </p>
          )}
        </div>

        {/* Features Checklist */}
        <div className="space-y-3 pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Included with plan:
          </p>
          <ul className="space-y-2.5">
            {(plan.features || []).map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs font-medium leading-relaxed text-foreground/85"
              >
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success-500/15 text-success-600 dark:text-success-400">
                  <Icon name="check" className="size-2.5 stroke-[3]" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-border/60">
        <Button
          variant={isCurrentPlan ? 'outline' : plan.highlight ? 'gradient-primary' : 'primary'}
          size="lg"
          className={cn(
            'w-full font-bold shadow-sm',
            plan.highlight && !isCurrentPlan && 'shadow-brand-500/25',
          )}
          loading={processing}
          disabled={isCurrentPlan || processing || !monthly?.price}
          onClick={() => onSelect && onSelect(plan)}
        >
          {isCurrentPlan ? 'Current Active Plan' : `Choose ${plan.displayName || plan.name}`}
        </Button>
        <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
          {unlimited
            ? 'No member cap · Unlimited athletes'
            : `Includes support for up to ${memberLimit ?? 100} members`}
        </p>
      </div>
    </Card>
  )
}