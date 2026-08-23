import { useState } from 'react'
import { db, type HighlightColor } from '../../lib/db'
import { createInitialSrsState } from '../../lib/srs'
import { shareVerseImage } from '../../lib/share'
import { HIGHLIGHT_COLORS } from './HighlightColorDot'
import { useSettingsStore } from '../../store/useSettingsStore'

interface VerseActionSheetProps {
  version: string
  abbrev: string
  bookName: string
  chapter: number
  verse: number
  text: string
  currentHighlight?: HighlightColor
  onClose: () => void
  onExplain: () => void
}

export function VerseActionSheet({
  version,
  abbrev,
  bookName,
  chapter,
  verse,
  text,
  currentHighlight,
  onClose,
  onExplain,
}: VerseActionSheetProps) {
  const aiApiKey = useSettingsStore((s) => s.aiApiKey)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const reference = `${bookName} ${chapter}:${verse}`

  async function toggleHighlight(color: HighlightColor) {
    const existing = await db.highlights.where({ version, abbrev, chapter, verse }).first()
    if (existing && existing.color === color) {
      await db.highlights.delete(existing.id!)
    } else if (existing) {
      await db.highlights.update(existing.id!, { color })
    } else {
      await db.highlights.add({ version, abbrev, chapter, verse, color, createdAt: Date.now() })
    }
    onClose()
  }

  async function saveNote() {
    if (!noteText.trim()) return
    await db.notes.add({
      version,
      abbrev,
      chapter,
      verse,
      text: noteText.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    onClose()
  }

  async function addBookmark() {
    await db.bookmarks.add({ abbrev, chapter, verse, createdAt: Date.now() })
    setFeedback('Salvo nos favoritos.')
    setTimeout(onClose, 500)
  }

  async function addToMemorize() {
    await db.srsCards.add({
      version,
      abbrev,
      chapter,
      verseStart: verse,
      verseEnd: verse,
      text,
      reference,
      ...createInitialSrsState(),
      createdAt: Date.now(),
    })
    setFeedback('Adicionado à memorização.')
    setTimeout(onClose, 500)
  }

  async function copyText() {
    await navigator.clipboard.writeText(`“${text}” — ${reference}`)
    setFeedback('Copiado.')
    setTimeout(onClose, 500)
  }

  async function share() {
    await shareVerseImage({ text, reference })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="animate-fade-in w-full max-w-xl rounded-t-3xl border-t border-border bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">{reference}</p>
        <p className="mb-4 font-scripture text-base leading-snug line-clamp-3">“{text}”</p>

        {feedback ? (
          <p className="py-3 text-center text-sm font-medium text-accent">{feedback}</p>
        ) : noteOpen ? (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escreva sua anotação…"
              rows={3}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={saveNote}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-bg"
            >
              Salvar anotação
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-center gap-3">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.id}
                  aria-label={`Destacar ${c.label}`}
                  onClick={() => toggleHighlight(c.id)}
                  className="h-8 w-8 rounded-full ring-offset-2 ring-offset-surface transition"
                  style={{
                    backgroundColor: c.bg,
                    boxShadow: currentHighlight === c.id ? `0 0 0 2px ${c.bg}` : undefined,
                  }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <ActionButton label="📝 Anotar" onClick={() => setNoteOpen(true)} />
              <ActionButton label="⭐ Favoritar" onClick={addBookmark} />
              <ActionButton label="🧠 Memorizar" onClick={addToMemorize} />
              <ActionButton label="🔗 Compartilhar" onClick={share} />
              <ActionButton label="📋 Copiar" onClick={copyText} />
              {aiApiKey && <ActionButton label="✨ Explicar com IA" onClick={onExplain} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-border py-2.5 hover:bg-surface-2">
      {label}
    </button>
  )
}
