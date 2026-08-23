import { useEffect, useState } from 'react'
import { BOOKS, type BibleBook } from '../data/books'
import { downloadBooks, downloadTestament, downloadWholeBible, getCoverageMap } from '../lib/offlineDownload'
import { useSettingsStore } from '../store/useSettingsStore'
import { useDownloadStore } from '../store/useDownloadStore'
import { PageHeader } from '../components/ui/PageHeader'
import { useOnlineStatus } from '../lib/useOnlineStatus'

export function Downloads() {
  const version = useSettingsStore((s) => s.version)
  const autoDownloadWholeBible = useSettingsStore((s) => s.autoDownloadWholeBible)
  const setAutoDownloadWholeBible = useSettingsStore((s) => s.setAutoDownloadWholeBible)
  const online = useOnlineStatus()
  const [coverage, setCoverage] = useState<Map<string, number>>(new Map())

  const running = useDownloadStore((s) => s.running)
  const source = useDownloadStore((s) => s.source)
  const progress = useDownloadStore((s) => s.progress)
  const downloadStore = useDownloadStore()

  async function refreshCoverage() {
    setCoverage(await getCoverageMap(version))
  }

  useEffect(() => {
    refreshCoverage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  // Atualiza a lista de "por livro" em tempo real enquanto um download roda
  // (seja ele automático ou disparado por um botão aqui).
  useEffect(() => {
    refreshCoverage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, progress?.abbrev])

  async function runManualDownload(task: () => Promise<{ failed: { error: string }[] }>) {
    downloadStore.start('manual')
    try {
      await task()
    } finally {
      downloadStore.finish()
      refreshCoverage()
    }
  }

  function downloadOne(book: BibleBook) {
    return runManualDownload(() =>
      downloadBooks(version, [book], (p) => downloadStore.update(p), () => downloadStore.cancelRequested),
    )
  }

  function downloadAll() {
    return runManualDownload(() =>
      downloadWholeBible(version, (p) => downloadStore.update(p), () => downloadStore.cancelRequested),
    )
  }

  function downloadTestamentGroup(t: 'AT' | 'NT') {
    return runManualDownload(() =>
      downloadTestament(version, t, (p) => downloadStore.update(p), () => downloadStore.cancelRequested),
    )
  }

  const totalCached = Array.from(coverage.values()).reduce((a, b) => a + b, 0)
  const totalChapters = BOOKS.reduce((a, b) => a + b.chapters, 0)
  const allDownloaded = totalCached >= totalChapters

  return (
    <div className="animate-fade-in">
      <PageHeader title="Leitura offline" subtitle={`${totalCached} de ${totalChapters} capítulos salvos no dispositivo`} />

      <div className="space-y-4 p-4">
        {!online && (
          <p className="rounded-xl bg-accent-soft p-3 text-sm text-accent">
            Você está offline. Conecte-se à internet para baixar novos capítulos.
          </p>
        )}

        {running && progress && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-medium">
              Baixando {progress.bookName} {progress.chapter}/{progress.totalChapters}…
            </p>
            <p className="text-xs text-text-muted">
              Livro {progress.booksDone + 1} de {progress.totalBooks}
              {source === 'auto' && ' · automático, em segundo plano'}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${Math.round(((progress.booksDone + progress.chapter / progress.totalChapters) / progress.totalBooks) * 100)}%` }}
              />
            </div>
            <button
              onClick={() => downloadStore.requestCancel()}
              className="mt-3 w-full rounded-lg border border-border py-2 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        )}

        {!running && allDownloaded && (
          <p className="rounded-xl bg-accent-soft p-3 text-center text-sm font-medium text-accent">
            ✓ Bíblia inteira baixada — disponível 100% offline
          </p>
        )}

        {!running && !allDownloaded && (
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

        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3.5">
          <span className="text-sm">
            Baixar a Bíblia inteira automaticamente
            <span className="block text-xs text-text-muted">
              Em segundo plano, sempre que houver internet, até todos os livros ficarem offline
            </span>
          </span>
          <input
            type="checkbox"
            checked={autoDownloadWholeBible}
            onChange={(e) => setAutoDownloadWholeBible(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-(--color-accent)"
          />
        </label>

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
                      disabled={!online || running}
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
