import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { parseReference } from '../lib/reference'
import { getBook } from '../data/books'
import { db } from '../lib/db'
import { useSettingsStore } from '../store/useSettingsStore'
import { PageHeader } from '../components/ui/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

interface SearchHit {
  abbrev: string
  bookName: string
  chapter: number
  verse: number
  text: string
}

export function Search() {
  const navigate = useNavigate()
  const version = useSettingsStore((s) => s.version)
  const [query, setQuery] = useState('')

  const cachedChapters = useLiveQuery(() => db.chapters.where('version').equals(version).toArray(), [version])

  const parsedJump = query.trim() ? parseReference(query) : null

  const hits = useMemo<SearchHit[]>(() => {
    const q = query.trim()
    if (q.length < 3 || !cachedChapters) return []
    const nq = normalize(q)
    const results: SearchHit[] = []
    for (const chapter of cachedChapters) {
      const book = getBook(chapter.abbrev)
      if (!book) continue
      for (const verse of chapter.verses) {
        if (normalize(verse.text).includes(nq)) {
          results.push({
            abbrev: chapter.abbrev,
            bookName: book.name,
            chapter: chapter.chapter,
            verse: verse.number,
            text: verse.text,
          })
          if (results.length >= 100) return results
        }
      }
    }
    return results
  }, [query, cachedChapters])

  return (
    <div className="animate-fade-in">
      <PageHeader title="Buscar" />
      <div className="space-y-3 p-4">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Referência (Jo 3:16) ou palavra-chave"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
        />

        {parsedJump && (
          <button
            onClick={() => navigate(`/ler/${parsedJump.book.abbrev}/${parsedJump.chapter}`)}
            className="w-full rounded-xl bg-accent px-4 py-3 text-left text-sm font-semibold text-bg"
          >
            Ir para {parsedJump.book.name} {parsedJump.chapter}
            {parsedJump.verseStart ? `:${parsedJump.verseStart}` : ''} →
          </button>
        )}

        {query.trim().length >= 3 && query.trim().length > 0 && !parsedJump && (
          <>
            <p className="text-xs text-text-muted">
              {hits.length > 0
                ? `${hits.length} resultado(s) nos capítulos já lidos/baixados`
                : 'Sem resultados nos capítulos já lidos ou baixados offline.'}
            </p>
            <ul className="space-y-2">
              {hits.map((hit) => (
                <li key={`${hit.abbrev}-${hit.chapter}-${hit.verse}`}>
                  <button
                    onClick={() => navigate(`/ler/${hit.abbrev}/${hit.chapter}`)}
                    className="w-full rounded-xl border border-border bg-surface p-3 text-left hover:border-accent"
                  >
                    <p className="mb-1 text-xs font-semibold text-accent">
                      {hit.bookName} {hit.chapter}:{hit.verse}
                    </p>
                    <p className="line-clamp-2 text-sm text-text-muted">{hit.text}</p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {query.trim().length === 0 && (
          <EmptyState
            icon="🔎"
            title="Busque por referência ou palavra"
            description="A busca por texto procura nos capítulos que você já leu ou baixou para offline. Baixe mais livros em Offline para ampliar a busca."
          />
        )}
      </div>
    </div>
  )
}
