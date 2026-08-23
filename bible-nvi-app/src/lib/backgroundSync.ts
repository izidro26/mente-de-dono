import { downloadWholeBible } from './offlineDownload'
import { useDownloadStore } from '../store/useDownloadStore'

function doneKey(version: string): string {
  return `verbo-full-bible-done-${version}`
}

function isMarkedDone(version: string): boolean {
  return localStorage.getItem(doneKey(version)) === 'true'
}

/**
 * Dispara (se ainda não estiver rodando nem já concluído) o download da
 * Bíblia inteira para o dispositivo, em segundo plano, sem bloquear a UI e
 * sem pedir confirmação — é isso que faz o app funcionar 100% offline em
 * qualquer livro, não só nos capítulos que o usuário já visitou.
 *
 * Resumível: cada capítulo já salvo é pulado (ver downloadBooks), então
 * fechar o app, ficar offline no meio do processo, ou abrir de novo depois
 * simplesmente continua de onde parou — não há re-download desnecessário.
 * Só marca como "concluído" (e para de tentar a cada abertura do app)
 * quando toda a Bíblia foi baixada com sucesso.
 */
export function startBackgroundFullDownload(version: string): void {
  const store = useDownloadStore.getState()
  if (store.running) return
  if (isMarkedDone(version)) return
  if (!navigator.onLine) return

  store.start('auto')

  downloadWholeBible(
    version,
    (progress) => useDownloadStore.getState().update(progress),
    () => useDownloadStore.getState().cancelRequested,
  )
    .then((result) => {
      if (!result.cancelled && result.failed.length === 0) {
        localStorage.setItem(doneKey(version), 'true')
      }
    })
    .finally(() => {
      useDownloadStore.getState().finish()
    })
}

export function isFullBibleDownloaded(version: string): boolean {
  return isMarkedDone(version)
}
