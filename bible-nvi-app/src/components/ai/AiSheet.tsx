import { useEffect, useState } from 'react'
import { explainVerse, generateDevotional, AiError } from '../../lib/ai'
import { useSettingsStore } from '../../store/useSettingsStore'
import { Spinner } from '../ui/Spinner'

interface AiSheetProps {
  kind: 'explain' | 'devotional'
  reference: string
  text: string
  onClose: () => void
}

const TITLES: Record<AiSheetProps['kind'], string> = {
  explain: '✨ Explicação por IA',
  devotional: '🙏 Devocional gerado por IA',
}

export function AiSheet({ kind, reference, text, onClose }: AiSheetProps) {
  const aiApiKey = useSettingsStore((s) => s.aiApiKey)
  const aiModel = useSettingsStore((s) => s.aiModel)
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [content, setContent] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    const fetcher = kind === 'explain' ? explainVerse : generateDevotional
    fetcher(aiApiKey, aiModel, reference, text)
      .then((res) => {
        if (!cancelled) {
          setContent(res)
          setStatus('done')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setContent(err instanceof AiError ? err.message : 'Erro inesperado.')
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [kind, aiApiKey, aiModel, reference, text])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="animate-fade-in max-h-[75vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">
          {TITLES[kind]} — {reference}
        </p>
        {status === 'loading' && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}
        {status !== 'loading' && <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>}
        <p className="mt-4 text-xs text-text-muted">
          Gerado por IA — pode conter imprecisões. Compare sempre com o texto bíblico.
        </p>
      </div>
    </div>
  )
}
