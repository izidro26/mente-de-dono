import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getBook, nextChapterRef, prevChapterRef } from '../data/books'
import { getChapter, BibleProviderError } from '../lib/bibleProvider'
import type { CachedVerse, HighlightColor } from '../lib/db'
import { db, markChapterRead } from '../lib/db'
import { useSettingsStore, FONT_SIZE_PX } from '../store/useSettingsStore'
import { useLastReadStore } from '../store/useLastReadStore'
import { PageHeader } from '../components/ui/PageHeader'
import { FullPageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { HIGHLIGHT_BG } from '../components/reader/HighlightColorDot'
import { VerseActionSheet } from '../components/reader/VerseActionSheet'
import { AiSheet } from '../components/ai/AiSheet'
import { isTtsSupported, speakChapter, stopSpeech, isSpeaking } from '../lib/tts'

export function ChapterReader() {
  const { abbrev = '', chapter: chapterStr = '1' } = useParams()
  const chapter = parseInt(chapterStr, 10)
  const navigate = useNavigate()
  const version = useSettingsStore((s) => s.version)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const setLastRead = useLastReadStore((s) => s.setLastRead)

  const [verses, setVerses] = useState<CachedVerse[] | null>(null)
  const [error, setError] = useState<BibleProviderError | null>(null)
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [explainVerse, setExplainVerse] = useState<number | null>(null)
  const [speaking, setSpeaking] = useState(false)

  const book = getBook(abbrev)

  useEffect(() => {
    setVerses(null)
    setError(null)
    stopSpeech()
    setSpeaking(false)
    if (!book) return

    getChapter(version, abbrev, chapter)
      .then((res) => {
        setVerses(res.verses)
        setLastRead(abbrev, chapter)
        markChapterRead(abbrev, chapter)
      })
      .catch((err) => setError(err instanceof BibleProviderError ? err : new BibleProviderError('Erro desconhecido', 'network')))
  }, [version, abbrev, chapter, book, setLastRead])

  const highlights = useLiveQuery(
    () => db.highlights.where({ version, abbrev, chapter }).toArray(),
    [version, abbrev, chapter],
  )
  const highlightByVerse = useMemo(() => {
    const map = new Map<number, HighlightColor>()
    highlights?.forEach((h) => map.set(h.verse, h.color))
    return map
  }, [highlights])

  const next = book ? nextChapterRef(abbrev, chapter) : null
  const prev = book ? prevChapterRef(abbrev, chapter) : null

  function toggleSpeak() {
    if (!verses) return
    if (isSpeaking()) {
      stopSpeech()
      setSpeaking(false)
      return
    }
    const fullText = verses.map((v) => v.text).join(' ')
    speakChapter(fullText, { onEnd: () => setSpeaking(false) })
    setSpeaking(true)
  }

  if (!book) {
    return <EmptyState title="Referência inválida" description="Este livro não existe." />
  }

  const selectedVerseData = selectedVerse != null ? verses?.find((v) => v.number === selectedVerse) : undefined
  const explainVerseData = explainVerse != null ? verses?.find((v) => v.number === explainVerse) : undefined

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${book.name} ${chapter}`}
        onBack={() => navigate('/ler')}
        action={
          isTtsSupported() && verses ? (
            <button
              onClick={toggleSpeak}
              aria-label={speaking ? 'Parar leitura' : 'Ouvir capítulo'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
            >
              {speaking ? '⏹️' : '🔊'}
            </button>
          ) : undefined
        }
      />

      {!verses && !error && <FullPageSpinner />}

      {error && (
        <EmptyState
          icon={error.kind === 'offline-no-cache' ? '📡' : '⚠️'}
          title={error.kind === 'offline-no-cache' ? 'Capítulo não disponível offline' : 'Não foi possível carregar'}
          description={error.message}
          action={
            error.kind === 'unauthorized' ? (
              <button
                onClick={() => navigate('/ajustes')}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg"
              >
                Configurar chave de API
              </button>
            ) : (
              <button
                onClick={() => navigate('/downloads')}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg"
              >
                Baixar para offline
              </button>
            )
          }
        />
      )}

      {verses && (
        <>
          <div
            className="font-scripture space-y-4 px-4 py-5"
            style={{ fontSize: FONT_SIZE_PX[fontSize] }}
          >
            {verses.map((v) => {
              const color = highlightByVerse.get(v.number)
              return (
                <p
                  key={v.number}
                  onClick={() => setSelectedVerse(v.number)}
                  className="cursor-pointer rounded-md px-1 py-0.5 transition active:scale-[0.99]"
                  style={color ? { backgroundColor: HIGHLIGHT_BG[color] } : undefined}
                >
                  <sup className="mr-1 font-sans text-xs font-semibold text-accent">{v.number}</sup>
                  {v.text}
                </p>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-3 px-4 pb-8 pt-2">
            <NavButton dir="prev" disabled={!prev} onClick={() => prev && navigate(`/ler/${prev.abbrev}/${prev.chapter}`)} />
            <NavButton dir="next" disabled={!next} onClick={() => next && navigate(`/ler/${next.abbrev}/${next.chapter}`)} />
          </div>
        </>
      )}

      {selectedVerseData && (
        <VerseActionSheet
          version={version}
          abbrev={abbrev}
          bookName={book.name}
          chapter={chapter}
          verse={selectedVerseData.number}
          text={selectedVerseData.text}
          currentHighlight={highlightByVerse.get(selectedVerseData.number)}
          onClose={() => setSelectedVerse(null)}
          onExplain={() => {
            setExplainVerse(selectedVerseData.number)
            setSelectedVerse(null)
          }}
        />
      )}

      {explainVerseData && (
        <AiSheet
          kind="explain"
          reference={`${book.name} ${chapter}:${explainVerseData.number}`}
          text={explainVerseData.text}
          onClose={() => setExplainVerse(null)}
        />
      )}
    </div>
  )
}

function NavButton({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-medium disabled:opacity-30"
    >
      {dir === 'prev' && '← Anterior'}
      {dir === 'next' && 'Próximo →'}
    </button>
  )
}
