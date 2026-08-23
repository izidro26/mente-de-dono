import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLocus } from '../data/theology'
import { getBook } from '../data/books'
import { useSettingsStore } from '../store/useSettingsStore'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { TheologyAskSheet } from '../components/ai/TheologyAskSheet'

export function TheologyLocus() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const aiApiKey = useSettingsStore((s) => s.aiApiKey)
  const [askOpen, setAskOpen] = useState(false)
  const locus = getLocus(id)

  if (!locus) return <EmptyState title="Tópico não encontrado" />

  return (
    <div className="animate-fade-in">
      <PageHeader title={locus.title} subtitle={locus.subtitle} />
      <div className="space-y-5 p-4">
        <p className="text-sm leading-relaxed text-text-muted">{locus.overview}</p>

        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Textos-chave
          </p>
          <div className="flex flex-wrap gap-2">
            {locus.keyVerses.map((v) => {
              const book = getBook(v.abbrev)
              return (
                <button
                  key={v.label}
                  onClick={() => navigate(`/ler/${v.abbrev}/${v.chapter}`)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:border-accent"
                  title={v.label}
                >
                  {book?.name} {v.chapter}
                  {v.verse ? `:${v.verse}` : ''}
                </button>
              )
            })}
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Pontos de tensão histórica — visão comparada
          </p>
          {locus.tensions.map((tension) => (
            <div key={tension.question} className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-3 font-medium">{tension.question}</p>
              <div className="space-y-3">
                {tension.views.map((view) => (
                  <div key={view.tradition} className="border-l-2 border-accent-soft pl-3">
                    <p className="text-xs font-semibold text-accent">{view.tradition}</p>
                    <p className="text-sm text-text-muted">{view.position}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {aiApiKey ? (
          <button
            onClick={() => setAskOpen(true)}
            className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-bg"
          >
            🎓 Aprofundar com IA nesta área
          </button>
        ) : (
          <button
            onClick={() => navigate('/ajustes')}
            className="w-full rounded-2xl border border-dashed border-border py-3.5 text-center text-sm text-text-muted"
          >
            Configure sua chave de IA em Ajustes para fazer perguntas mais profundas
          </button>
        )}
      </div>

      {askOpen && <TheologyAskSheet locusTitle={locus.title} onClose={() => setAskOpen(false)} />}
    </div>
  )
}
