import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BOOKS, getBook, type Testament } from '../data/books'
import { parseReference } from '../lib/reference'
import { PageHeader } from '../components/ui/PageHeader'

const TESTAMENT_LABEL: Record<Testament, string> = { AT: 'Antigo Testamento', NT: 'Novo Testamento' }

export function BookPicker() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return BOOKS
    const q = query.toLowerCase()
    return BOOKS.filter((b) => b.name.toLowerCase().includes(q) || b.abbrev.includes(q))
  }, [query])

  const grouped = useMemo(() => {
    const groups: Record<Testament, typeof BOOKS> = { AT: [], NT: [] }
    for (const b of filtered) groups[b.testament].push(b)
    return groups
  }, [filtered])

  const parsedJump = query.trim() ? parseReference(query) : null
  const selectedBook = selected ? getBook(selected) : null

  if (selectedBook) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={selectedBook.name} subtitle="Escolha o capítulo" onBack={() => setSelected(null)} />
        <div className="grid grid-cols-6 gap-2 p-4">
          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((ch) => (
            <button
              key={ch}
              onClick={() => navigate(`/ler/${selectedBook.abbrev}/${ch}`)}
              className="flex aspect-square items-center justify-center rounded-xl border border-border bg-surface text-sm font-medium hover:border-accent hover:text-accent"
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Ler" />
      <div className="space-y-4 p-4">
        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar livro ou referência (ex: Jo 3:16)"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
          />
          {parsedJump && (
            <button
              onClick={() => navigate(`/ler/${parsedJump.book.abbrev}/${parsedJump.chapter}`)}
              className="mt-2 w-full rounded-xl bg-accent px-4 py-2.5 text-left text-sm font-medium text-bg"
            >
              Ir para {parsedJump.book.name} {parsedJump.chapter}
              {parsedJump.verseStart ? `:${parsedJump.verseStart}` : ''} →
            </button>
          )}
        </div>

        {(['AT', 'NT'] as Testament[]).map((t) =>
          grouped[t].length > 0 ? (
            <div key={t}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {TESTAMENT_LABEL[t]}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {grouped[t].map((book) => (
                  <button
                    key={book.abbrev}
                    onClick={() => setSelected(book.abbrev)}
                    className="rounded-xl border border-border bg-surface px-3 py-3 text-left text-sm font-medium hover:border-accent"
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}
