import { useEffect, useRef, useState } from 'react'
import { BOOKS, type BibleBook } from '../data/books'
import {
  downloadBooks,
  downloadTestament,
  downloadWholeBible,
  getCoverageMap,
  type DownloadProgress,
} from '../lib/offlineDownload'
import { useSettingsStore } from '../store/useSettingsStore'
import { PageHeader } from '../components/ui/PageHeader'
import { useOnlineStatus } from '../lib/useOnlineStatus'

export function Downloads() {
  const version = useSettingsStore((s) => s.version)
  const online = useOnlineStatus()
  const [coverage, setCoverage] = useState<Map<string, number>>(new Map())
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [busy, setBusy] = useState(false)
  const cancelRef = useRef(false)

  async function refreshCoverage() {
    setCoverage(await getCoverageMap(version))
  }

  useEffect(() => {
    refreshCoverage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  async function runDownload(task: () => Promise<{ failed: { error: string }[] }>) {
    setBusy(true)
    cancelRef.current = false
    try {
      await task()
    } finally {
      setBusy(false)
      setProgress(null)
      refreshCoverage()
    }
  }

  function downloadOne(book: BibleBook) {
    return runDownload(() =>
      downloadBooks(version, [book], setProgress, () => cancelRef.current),
    )
  }

  function downloadAll() {
    return runDownload(() => downloadWholeBible(version, setProgress, () => cancelRef.current))
  }

  function downloadTestamentGroup(t: 'AT' | 'NT') {
    return runDownload(() => downloadTestament(version, t, setProgress, () => cancelRef.current))
  }

  const totalCached = Array.from(coverage.values()).reduce((a, b) => a + b, 0)
  const totalChapters = BOOKS.reduce((a, b) => a + b.chapters, 0)

  return (
    <div className="animate-fade-in">
      <PageHeader title="Leitura offline" subtitle={`${totalCached} de ${totalChapters} capítulos salvos no dispositivo`} />

      <div className="space-y-4 p-4">
        {!online && (
          <p className="rounded-xl bg-accent-soft p-3 text-sm text-accent">
            Você está offline. Conecte-se à internet para baixar novos capítulos.
          </p>
        )}

        {busy && progress && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-medium">
              Baixando {progress.bookName} {progress.chapter}/{progress.totalChapters}…
            </p>
            <p className="text-xs text-text-muted">
              Livro {progress.booksDone + 1} de {progress.totalBooks}
            </p>
            <button
              onClick={() => (cancelRef.current = true)}
              className="mt-3 w-full rounded-lg border border-border py-2 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        )}

        {!busy && (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={downloadAll}
              disabled={!online}
              className="rounded-xl bg-accent py-3 text-sm font-semibold text-bg disabled:opacity-40"
            >
              Baixar Bíblia completa ({version.toUpperCase()})
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadTestamentGroup('AT')}
                disabled={!online}
                className="rounded-xl border border-border py-2.5 text-sm font-medium disabled:opacity-40"
              >
                Baixar Antigo Testamento
              </button>
              <button
                onClick={() => downloadTestamentGroup('NT')}
                disabled={!online}
                className="rounded-xl border border-border py-2.5 text-sm font-medium disabled:opacity-40"
              >
                Baixar Novo Testamento
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">Por livro</p>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {BOOKS.map((book) => {
              const cached = coverage.get(book.abbrev) ?? 0
              const complete = cached >= book.chapters
              return (
                <li key={book.abbrev} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{book.name}</p>
                    <p className="text-xs text-text-muted">
                      {cached}/{book.chapters} capítulos
                    </p>
                  </div>
                  {complete ? (
                    <span className="text-xs font-semibold text-accent">Baixado ✓</span>
                  ) : (
                    <button
                      onClick={() => downloadOne(book)}
                      disabled={!online || busy}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      Baixar
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
