import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type SrsCard } from '../lib/db'
import { reviewCard, type SrsGrade } from '../lib/srs'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

const GRADE_BUTTONS: { grade: SrsGrade; label: string; className: string }[] = [
  { grade: 0, label: 'Esqueci', className: 'bg-rose-500/15 text-rose-500' },
  { grade: 1, label: 'Difícil', className: 'bg-orange-500/15 text-orange-500' },
  { grade: 2, label: 'Bom', className: 'bg-sky-500/15 text-sky-500' },
  { grade: 3, label: 'Fácil', className: 'bg-emerald-500/15 text-emerald-500' },
]

export function Memorize() {
  const allCards = useLiveQuery(() => db.srsCards.toArray(), [])
  const [queue, setQueue] = useState<SrsCard[] | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!allCards) return
    const now = Date.now()
    setQueue((prev) => prev ?? allCards.filter((c) => c.dueAt <= now))
  }, [allCards])

  if (allCards === undefined || queue === null) return null

  if (allCards.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Memorizar" />
        <EmptyState
          icon="🧠"
          title="Nenhum versículo para memorizar ainda"
          description="Durante a leitura, toque em um versículo e escolha “Memorizar” para adicioná-lo aqui."
        />
      </div>
    )
  }

  const current = queue[0]

  async function grade(g: SrsGrade) {
    if (!current) return
    const result = reviewCard(current, g)
    await db.srsCards.update(current.id!, result)
    setQueue((q) => q!.slice(1))
    setRevealed(false)
  }

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-6rem)] flex-col">
      <PageHeader title="Memorizar" subtitle={`${queue.length} pendente(s) hoje · ${allCards.length} no total`} />

      {!current ? (
        <EmptyState icon="🎉" title="Tudo revisado por hoje!" description="Volte amanhã para continuar fortalecendo sua memória." />
      ) : (
        <div className="flex flex-1 flex-col justify-between p-4">
          <button
            onClick={() => setRevealed((r) => !r)}
            className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center shadow-sm"
          >
            <p className="text-sm font-semibold text-accent">{current.reference}</p>
            {revealed ? (
              <p className="font-scripture text-xl leading-relaxed">“{current.text}”</p>
            ) : (
              <p className="text-sm text-text-muted">Toque para revelar o texto</p>
            )}
          </button>

          {revealed && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {GRADE_BUTTONS.map((b) => (
                <button
                  key={b.grade}
                  onClick={() => grade(b.grade)}
                  className={`rounded-xl py-3 text-xs font-semibold ${b.className}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
