import { BOOKS, type BibleBook } from '../data/books'
import { db, chapterKey } from './db'
import { BibleProviderError, getChapter } from './bibleProvider'

export interface DownloadProgress {
  abbrev: string
  bookName: string
  chapter: number
  totalChapters: number
  booksDone: number
  totalBooks: number
}

export interface DownloadResult {
  cancelled: boolean
  failed: { abbrev: string; chapter: number; error: string }[]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Baixa todos os capítulos de uma lista de livros para o IndexedDB,
 * permitindo leitura 100% offline depois. Pula capítulos já em cache.
 *
 * `politeDelayMs` (opcional) espaça as requisições de rede reais — não os
 * capítulos pulados por já estarem em cache — para não sobrecarregar a API
 * gratuita do provedor bíblico. Usado pelo download automático em segundo
 * plano; downloads manuais (o usuário está olhando e esperando) continuam
 * na velocidade máxima.
 */
export async function downloadBooks(
  version: string,
  books: BibleBook[],
  onProgress?: (p: DownloadProgress) => void,
  shouldCancel?: () => boolean,
  politeDelayMs = 0,
): Promise<DownloadResult> {
  const failed: DownloadResult['failed'] = []
  const totalBooks = books.length

  for (let bi = 0; bi < books.length; bi++) {
    const book = books[bi]
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      if (shouldCancel?.()) return { cancelled: true, failed }

      onProgress?.({
        abbrev: book.abbrev,
        bookName: book.name,
        chapter,
        totalChapters: book.chapters,
        booksDone: bi,
        totalBooks,
      })

      const key = chapterKey(version, book.abbrev, chapter)
      const alreadyCached = await db.chapters.get(key)
      if (alreadyCached) continue

      try {
        await getChapter(version, book.abbrev, chapter, { forceRefresh: false })
      } catch (err) {
        const message = err instanceof BibleProviderError ? err.message : 'Falha desconhecida'
        failed.push({ abbrev: book.abbrev, chapter, error: message })
      }

      if (politeDelayMs > 0) await sleep(politeDelayMs)
    }
  }

  return { cancelled: false, failed }
}

export async function downloadTestament(
  version: string,
  testament: 'AT' | 'NT',
  onProgress?: (p: DownloadProgress) => void,
  shouldCancel?: () => boolean,
  politeDelayMs = 0,
): Promise<DownloadResult> {
  return downloadBooks(version, BOOKS.filter((b) => b.testament === testament), onProgress, shouldCancel, politeDelayMs)
}

export async function downloadWholeBible(
  version: string,
  onProgress?: (p: DownloadProgress) => void,
  shouldCancel?: () => boolean,
  politeDelayMs = 0,
): Promise<DownloadResult> {
  return downloadBooks(version, BOOKS, onProgress, shouldCancel, politeDelayMs)
}

export interface OfflineCoverage {
  cachedChapters: number
  totalChapters: number
}

export async function getOfflineCoverage(version: string, book: BibleBook): Promise<OfflineCoverage> {
  const keys = Array.from({ length: book.chapters }, (_, i) => chapterKey(version, book.abbrev, i + 1))
  const rows = await db.chapters.bulkGet(keys)
  return { cachedChapters: rows.filter(Boolean).length, totalChapters: book.chapters }
}

/** Conta quantos capítulos de cada livro já estão em cache, em uma única consulta. */
export async function getCoverageMap(version: string): Promise<Map<string, number>> {
  const rows = await db.chapters.where('version').equals(version).toArray()
  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(row.abbrev, (map.get(row.abbrev) ?? 0) + 1)
  }
  return map
}
