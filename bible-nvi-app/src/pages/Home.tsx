import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getVerseOfTheDay, type VerseOfTheDay, BibleProviderError } from '../lib/bibleProvider'
import { getCurrentStreak } from '../lib/db'
import { shareVerseImage } from '../lib/share'
import { useSettingsStore } from '../store/useSettingsStore'
import { useLastReadStore } from '../store/useLastReadStore'
import { getBook } from '../data/books'
import { Spinner } from '../components/ui/Spinner'
import { AiSheet } from '../components/ai/AiSheet'

export function Home() {
  const version = useSettingsStore((s) => s.version)
  const aiApiKey = useSettingsStore((s) => s.aiApiKey)
  const lastRead = useLastReadStore()
  const [votd, setVotd] = useState<VerseOfTheDay | null>(null)
  const [votdError, setVotdError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [sharing, setSharing] = useState(false)
  const [devotionalOpen, setDevotionalOpen] = useState(false)

  useEffect(() => {
    getVerseOfTheDay(version)
      .then(setVotd)
      .catch((err) => setVotdError(err instanceof BibleProviderError ? err.message : 'Não foi possível carregar.'))
    getCurrentStreak().then(setStreak)
  }, [version])

  const lastBook = getBook(lastRead.abbrev)
  const greeting = getGreeting()

  async function handleShare() {
    if (!votd) return
    setSharing(true)
    try {
      await shareVerseImage({
        text: votd.text,
        reference: `${votd.bookName} ${votd.chapter}:${votd.verse}`,
      })
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6 px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">{greeting}</p>
          <h1 className="text-2xl font-bold font-scripture">Verbo</h1>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent">
              🔥 {streak} {streak === 1 ? 'dia' : 'dias'}
            </div>
          )}
          <Link
            to="/ajustes"
            aria-label="Ajustes"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:bg-surface-2"
          >
            ⚙️
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Versículo de hoje
        </p>
        {votd ? (
          <>
            <p className="font-scripture text-xl leading-relaxed">“{votd.text}”</p>
            <div className="mt-4 flex items-center justify-between">
              <Link to={`/ler/${votd.abbrev}/${votd.chapter}`} className="text-sm font-semibold text-accent">
                {votd.bookName} {votd.chapter}:{votd.verse}
              </Link>
              <div className="flex gap-2">
                {aiApiKey && (
                  <button
                    onClick={() => setDevotionalOpen(true)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-2"
                  >
                    ✨ Devocional
                  </button>
                )}
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-2 disabled:opacity-50"
                >
                  {sharing ? <Spinner size={14} /> : 'Compartilhar'}
                </button>
              </div>
            </div>
          </>
        ) : votdError ? (
          <p className="text-sm text-text-muted">{votdError}</p>
        ) : (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}
      </section>

      {lastBook && (
        <Link
          to={`/ler/${lastRead.abbrev}/${lastRead.chapter}`}
          className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-accent"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Continuar lendo</p>
            <p className="mt-1 font-medium">
              {lastBook.name} {lastRead.chapter}
            </p>
          </div>
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}

      <section className="grid grid-cols-3 gap-3">
        <ShortcutCard to="/planos" emoji="🗓️" label="Planos" />
        <ShortcutCard to="/memorizar" emoji="🧠" label="Memorizar" />
        <ShortcutCard to="/downloads" emoji="⬇️" label="Offline" />
      </section>

      {votd && devotionalOpen && (
        <AiSheet
          kind="devotional"
          reference={`${votd.bookName} ${votd.chapter}:${votd.verse}`}
          text={votd.text}
          onClose={() => setDevotionalOpen(false)}
        />
      )}
    </div>
  )
}

function ShortcutCard({ to, emoji, label }: { to: string; emoji: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface py-4 text-center shadow-sm transition hover:border-accent"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Boa madrugada'
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
