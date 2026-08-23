import { create } from 'zustand'
import type { DownloadProgress } from '../lib/offlineDownload'

export type DownloadSource = 'auto' | 'manual'

interface DownloadState {
  running: boolean
  source: DownloadSource | null
  progress: DownloadProgress | null
  cancelRequested: boolean
  start: (source: DownloadSource) => void
  update: (progress: DownloadProgress) => void
  finish: () => void
  requestCancel: () => void
}

/**
 * Estado compartilhado do processo de download offline — usado tanto pelo
 * download automático em segundo plano (disparado no App.tsx) quanto pelos
 * botões manuais da tela de Downloads, para que os dois nunca rodem ao
 * mesmo tempo e o progresso apareça em qualquer lugar do app.
 */
export const useDownloadStore = create<DownloadState>((set) => ({
  running: false,
  source: null,
  progress: null,
  cancelRequested: false,
  start: (source) => set({ running: true, source, progress: null, cancelRequested: false }),
  update: (progress) => set({ progress }),
  finish: () => set({ running: false, source: null, progress: null, cancelRequested: false }),
  requestCancel: () => set({ cancelRequested: true }),
}))
