import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { getBook } from '../data/books'
import { HIGHLIGHT_COLORS } from '../components/reader/HighlightColorDot'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

type Tab = 'notas' | 'destaques' | 'favoritos'

export function Notes() {
  const [tab, setTab] = useState<Tab>('notas')
  const navigate = useNavigate()

  const notes = useLiveQuery(() => db.notes.orderBy('createdAt').reverse().toArray(), [])
  const highlights = useLiveQuery(() => db.highlights.orderBy('createdAt').reverse().toArray(), [])
  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('createdAt').reverse().toArray(), [])

  return (
    <div className="animate-fade-in">
      <PageHeader title="Minhas anotações" />
      <div className="flex gap-2 px-4 pt-3">
        <TabButton active={tab === 'notas'} onClick={() => setTab('notas')} label="Notas" />
        <TabButton active={tab === 'destaques'} onClick={() => setTab('destaques')} label="Destaques" />
        <TabButton active={tab === 'favoritos'} onClick={() => setTab('favoritos')} label="Favoritos" />
      </div>

      <div className="space-y-2 p-4">
        {tab === 'notas' &&
          (notes && notes.length > 0 ? (
            notes.map((n) => {
              const book = getBook(n.abbrev)
              return (
                <Row
                  key={n.id}
                  onClick={() => navigate(`/ler/${n.abbrev}/${n.chapter}`)}
                  onDelete={() => db.notes.delete(n.id!)}
                >
                  <p className="text-xs font-semibold text-accent">
                    {book?.name} {n.chapter}:{n.verse}
                  </p>
                  <p className="mt-1 text-sm">{n.text}</p>
                </Row>
              )
            })
          ) : (
            <EmptyState icon="📝" title="Nenhuma anotação ainda" description="Toque em um versículo durante a leitura para anotar." />
          ))}

        {tab === 'destaques' &&
          (highlights && highlights.length > 0 ? (
            highlights.map((h) => {
              const book = getBook(h.abbrev)
              const color = HIGHLIGHT_COLORS.find((c) => c.id === h.color)
              return (
                <Row
                  key={h.id}
                  onClick={() => navigate(`/ler/${h.abbrev}/${h.chapter}`)}
                  onDelete={() => db.highlights.delete(h.id!)}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color?.bg }} />
                    <p className="text-sm font-medium">
                      {book?.name} {h.chapter}:{h.verse}
                    </p>
                  </div>
                </Row>
              )
            })
          ) : (
            <EmptyState icon="🖍️" title="Nenhum destaque ainda" description="Toque em um versículo e escolha uma cor para destacar." />
          ))}

        {tab === 'favoritos' &&
          (bookmarks && bookmarks.length > 0 ? (
            bookmarks.map((b) => {
              const book = getBook(b.abbrev)
              return (
                <Row
                  key={b.id}
                  onClick={() => navigate(`/ler/${b.abbrev}/${b.chapter}`)}
                  onDelete={() => db.bookmarks.delete(b.id!)}
                >
                  <p className="text-sm font-medium">
                    ⭐ {book?.name} {b.chapter}
                    {b.verse ? `:${b.verse}` : ''}
                  </p>
                </Row>
              )
            })
          ) : (
            <EmptyState icon="⭐" title="Nenhum favorito ainda" description="Toque em um versículo e escolha “Favoritar”." />
          ))}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active ? 'bg-accent text-bg' : 'bg-surface-2 text-text-muted'
      }`}
    >
      {label}
    </button>
  )
}

function Row({
  children,
  onClick,
  onDelete,
}: {
  children: React.ReactNode
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3">
      <button onClick={onClick} className="flex-1 text-left">
        {children}
      </button>
      <button
        onClick={onDelete}
        aria-label="Excluir"
        className="shrink-0 rounded-full p-1.5 text-text-muted hover:bg-surface-2"
      >
        ✕
      </button>
    </div>
  )
}
