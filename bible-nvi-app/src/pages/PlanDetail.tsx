import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { dayId, getPlan } from '../data/plans'
import { formatDayRefs } from '../lib/planFormat'
import { db, now } from '../lib/db'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

export function PlanDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const plan = getPlan(id)
  const progress = useLiveQuery(() => db.planProgress.get(id), [id])

  if (!plan) {
    return <EmptyState title="Plano não encontrado" />
  }

  const completed = new Set(progress?.completedDayIds ?? [])
  const doneCount = completed.size
  const pct = Math.round((doneCount / plan.days.length) * 100)

  async function toggleDay(index: number) {
    const id0 = dayId(plan!.id, index)
    const existing = await db.planProgress.get(plan!.id)
    const set = new Set(existing?.completedDayIds ?? [])
    if (set.has(id0)) set.delete(id0)
    else set.add(id0)
    await db.planProgress.put({
      planId: plan!.id,
      completedDayIds: Array.from(set),
      startedAt: existing?.startedAt ?? now(),
      lastReadAt: now(),
    })
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={plan.title} subtitle={`${doneCount}/${plan.days.length} dias · ${pct}%`} />
      <div className="space-y-2 p-4">
        <p className="text-sm text-text-muted">{plan.description}</p>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>

        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {plan.days.map((refs, index) => {
            const id0 = dayId(plan.id, index)
            const isDone = completed.has(id0)
            const first = refs[0]
            return (
              <li key={id0} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => toggleDay(index)}
                  aria-label={isDone ? 'Marcar como não lido' : 'Marcar como lido'}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                    isDone ? 'border-accent bg-accent text-bg' : 'border-border text-transparent'
                  }`}
                >
                  ✓
                </button>
                <button
                  onClick={() => first && navigate(`/ler/${first.abbrev}/${first.chapter}`)}
                  className="flex-1 text-left"
                >
                  <p className="text-xs font-semibold text-text-muted">Dia {index + 1}</p>
                  <p className={`text-sm ${isDone ? 'text-text-muted line-through' : ''}`}>
                    {formatDayRefs(refs)}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
