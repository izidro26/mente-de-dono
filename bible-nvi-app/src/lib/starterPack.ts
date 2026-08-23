import { STARTER_PACK } from '../data/starterPack'
import { getChapter } from './bibleProvider'
import { db, chapterKey } from './db'

function storageKey(version: string): string {
  return `verbo-starter-pack-${version}`
}

/**
 * Garante que o pacote inicial de leitura offline (ver src/data/starterPack.ts)
 * esteja salvo no dispositivo. Roda em segundo plano, sem bloquear a UI e sem
 * pedir permissão — é dados públicos e pequenos, pensados para nunca deixar
 * quem acabou de instalar o app "preso" sem nada pra ler se cair a conexão.
 * Não repete o trabalho: pula capítulos já em cache e só tenta de novo a
 * cada versão caso ainda não tenha concluído com sucesso.
 */
export async function ensureStarterPackDownloaded(version: string): Promise<void> {
  if (!navigator.onLine) return
  if (localStorage.getItem(storageKey(version)) === 'done') return

  let allOk = true
  for (const ref of STARTER_PACK) {
    const key = chapterKey(version, ref.abbrev, ref.chapter)
    const cached = await db.chapters.get(key)
    if (cached) continue
    try {
      await getChapter(version, ref.abbrev, ref.chapter)
    } catch {
      allOk = false
    }
  }

  if (allOk) localStorage.setItem(storageKey(version), 'done')
}
