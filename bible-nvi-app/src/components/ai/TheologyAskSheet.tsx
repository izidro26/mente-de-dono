import { useState } from 'react'
import { answerTheologyQuestion, AiError } from '../../lib/ai'
import { useSettingsStore } from '../../store/useSettingsStore'
import { Spinner } from '../ui/Spinner'

interface TheologyAskSheetProps {
  locusTitle: string
  onClose: () => void
}

export function TheologyAskSheet({ locusTitle, onClose }: TheologyAskSheetProps) {
  const aiApiKey = useSettingsStore((s) => s.aiApiKey)
  const aiModel = useSettingsStore((s) => s.aiModel)
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [answer, setAnswer] = useState('')

  async function ask() {
    if (!question.trim()) return
    setStatus('loading')
    try {
      const res = await answerTheologyQuestion(aiApiKey, aiModel, locusTitle, question.trim())
      setAnswer(res)
      setStatus('done')
    } catch (err) {
      setAnswer(err instanceof AiError ? err.message : 'Erro inesperado.')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="animate-fade-in max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent">
          🎓 Aprofundar — {locusTitle}
        </p>

        {status === 'idle' && (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Qual a diferença entre supralapsarianismo e infralapsarianismo?"
              rows={3}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={ask}
              disabled={!question.trim()}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-bg disabled:opacity-50"
            >
              Perguntar
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {(status === 'done' || status === 'error') && (
          <>
            <p className="mb-3 rounded-xl bg-surface-2 p-3 text-sm italic text-text-muted">{question}</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
            <button
              onClick={() => {
                setStatus('idle')
                setQuestion('')
                setAnswer('')
              }}
              className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-surface-2"
            >
              Fazer outra pergunta
            </button>
          </>
        )}

        <p className="mt-4 text-xs text-text-muted">
          Gerado por IA num tom neutro/ecumênico entre tradições cristãs — pode conter imprecisões.
        </p>
      </div>
    </div>
  )
}
