import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSetupStatus } from '../services/setup'

export default function SetupBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ['setup-status'],
    queryFn: getSetupStatus,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading || !data || data.setupComplete) return null

  return (
    <Link
      to="/setup"
      className="block overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-600 to-brand-500 p-4 text-white shadow-card transition hover:shadow-lg dark:border-brand-500/40"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">🎯</span>
          <div>
            <p className="text-sm font-bold">Finish your gym setup</p>
            <p className="text-xs text-white/80">
              You&apos;ve completed {data.completionPercent || 0}% — a few quick steps and your gym is ready.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold">
          Continue →
        </span>
      </div>
    </Link>
  )
}
