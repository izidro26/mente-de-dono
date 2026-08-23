import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { READING_PLANS } from '../data/plans'
import { db } from '../lib/db'
import { PageHeader } from '../components/ui/PageHeader'

export function Plans() {
  const allProgress = useLiveQuery(() => db.planProgress.toArray(), [])
  const progressById = new Map(allProgress?.map((p) => [p.planId, p]))

  return (
    <div className="animate-fade-in">
      <PageHeader title="Planos de leitura" />
      <div className="space-y-3 p-4">
        {READING_PLANS.map((plan) => {
          const progress = progressById.get(plan.id)
          const done = progress?.completedDayIds.length ?? 0
          const pct = Math.round((done / plan.days.length) * 100)
          return (
            <Link
              key={plan.id}
              to={`/planos/${plan.id}`}
              className="block rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {plan.emoji} {plan.title}
                  </p>
                  <p className="mt-0.5 text-sm text-text-muted">{plan.description}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-text-muted">{plan.days.length}d</span>
              </div>
              {done > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    {done}/{plan.days.length} dias · {pct}%
                  </p>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
