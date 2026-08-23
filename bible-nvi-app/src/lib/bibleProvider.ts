import { db, chapterKey, type CachedVerse } from './db'
import { getBook } from '../data/books'

/**
 * Camada de acesso ao texto bíblico.
 *
 * O app não embute o texto da NVI (Nova Versão Internacional) no código-fonte:
 * a tradução é protegida por direitos autorais (© Biblica / Sociedade Bíblica
 * Internacional). Em vez disso, o texto é obtido em tempo real de um provedor
 * HTTP configurável — por padrão a API pública e gratuita "A Bíblia Digital"
 * (https://www.abibliadigital.com.br) — e cada capítulo consultado é guardado
 * no IndexedDB do dispositivo (ver src/lib/db.ts), permitindo releitura 100%
 * offline depois da primeira visita, exatamente como um app de bíblia
 * "baixe para ler offline" tradicional.
 *
 * Se o formato da API mudar ou você preferir outro provedor (ex: um serviço
 * próprio, ou uma versão self-hosted), troque a implementação de
 * `fetchChapterFromNetwork` abaixo — o resto do app não precisa mudar.
 */

const DEFAULT_API_BASE = 'https://www.abibliadigital.com.br/api'

export type BibleProviderErrorKind = 'offline-no-cache' | 'unauthorized' | 'not-found' | 'network'

export class BibleProviderError extends Error {
  kind: BibleProviderErrorKind

  constructor(message: string, kind: BibleProviderErrorKind) {
    super(message)
    this.name = 'BibleProviderError'
    this.kind = kind
  }
}

interface ProviderConfig {
  apiBase: string
  apiToken: string
}

function getConfig(): ProviderConfig {
  const raw = localStorage.getItem('verbo-settings')
  let apiBase = DEFAULT_API_BASE
  let apiToken = ''
  try {
    if (raw) {
      const parsed = JSON.parse(raw)
      apiBase = parsed?.state?.apiBase || DEFAULT_API_BASE
      apiToken = parsed?.state?.apiToken || ''
    }
  } catch {
    // configuração inválida, usa padrão
  }
  return { apiBase, apiToken }
}

interface RawApiChapter {
  book?: { name?: string }
  chapter?: { number?: number; verses?: number }
  verses: { number: number; text: string }[]
}

async function fetchChapterFromNetwork(
  version: string,
  abbrev: string,
  chapter: number,
): Promise<CachedVerse[]> {
  const { apiBase, apiToken } = getConfig()
  let res: Response
  try {
    res = await fetch(`${apiBase}/verses/${version}/${abbrev}/${chapter}`, {
      headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
    })
  } catch {
    throw new BibleProviderError(
      'Não foi possível conectar ao provedor bíblico. Verifique sua internet.',
      'network',
    )
  }

  if (res.status === 401 || res.status === 403) {
    throw new BibleProviderError(
      'Token de acesso inválido ou ausente. Configure sua chave gratuita em Ajustes.',
      'unauthorized',
    )
  }
  if (res.status === 404) {
    throw new BibleProviderError('Capítulo não encontrado nesta versão.', 'not-found')
  }
  if (!res.ok) {
    throw new BibleProviderError(`Erro do provedor bíblico (HTTP ${res.status}).`, 'network')
  }

  const data = (await res.json()) as RawApiChapter
  return data.verses.map((v) => ({ number: v.number, text: v.text }))
}

export interface GetChapterOptions {
  /** Ignora o cache e força uma nova consulta à rede (mantendo o cache atualizado). */ forceRefresh?: boolean
}

/**
 * Retorna os versículos de um capítulo, priorizando o cache local (IndexedDB).
 * Se houver cache, ele é servido imediatamente e, quando online, atualizado
 * em segundo plano (stale-while-revalidate). Sem cache e sem rede, lança
 * BibleProviderError('offline-no-cache').
 */
export async function getChapter(
  version: string,
  abbrev: string,
  chapter: number,
  options: GetChapterOptions = {},
): Promise<{ verses: CachedVerse[]; fromCache: boolean }> {
  const book = getBook(abbrev)
  if (!book) throw new BibleProviderError(`Livro desconhecido: ${abbrev}`, 'not-found')

  const key = chapterKey(version, abbrev, chapter)
  const cached = options.forceRefresh ? undefined : await db.chapters.get(key)

  if (cached) {
    if (navigator.onLine) {
      // revalida em segundo plano, sem bloquear a leitura
      fetchChapterFromNetwork(version, abbrev, chapter)
        .then((verses) => db.chapters.put({ id: key, version, abbrev, chapter, verses, fetchedAt: Date.now() }))
        .catch(() => undefined)
    }
    return { verses: cached.verses, fromCache: true }
  }

  if (!navigator.onLine) {
    throw new BibleProviderError(
      'Este capítulo ainda não foi baixado e você está offline.',
      'offline-no-cache',
    )
  }

  const verses = await fetchChapterFromNetwork(version, abbrev, chapter)
  await db.chapters.put({ id: key, version, abbrev, chapter, verses, fetchedAt: Date.now() })
  return { verses, fromCache: false }
}

export interface VerseOfTheDay {
  abbrev: string
  bookName: string
  chapter: number
  verse: number
  text: string
}

/**
 * Versículo do dia: escolhido deterministicamente a partir da data (mesmo
 * versículo o dia todo, em qualquer dispositivo), de uma lista curada de
 * referências conhecidas. O texto é então buscado via getChapter (com cache).
 */
const VOTD_REFERENCES: { abbrev: string; chapter: number; verse: number }[] = [
  { abbrev: 'jo', chapter: 3, verse: 16 },
  { abbrev: 'sl', chapter: 23, verse: 1 },
  { abbrev: 'pv', chapter: 3, verse: 5 },
  { abbrev: 'is', chapter: 41, verse: 10 },
  { abbrev: 'jr', chapter: 29, verse: 11 },
  { abbrev: 'rm', chapter: 8, verse: 28 },
  { abbrev: 'fp', chapter: 4, verse: 13 },
  { abbrev: 'fp', chapter: 4, verse: 6 },
  { abbrev: 'js', chapter: 1, verse: 9 },
  { abbrev: 'sl', chapter: 46, verse: 1 },
  { abbrev: 'mt', chapter: 11, verse: 28 },
  { abbrev: 'gl', chapter: 5, verse: 22 },
  { abbrev: '1co', chapter: 13, verse: 4 },
  { abbrev: 'hb', chapter: 11, verse: 1 },
  { abbrev: 'sl', chapter: 119, verse: 105 },
  { abbrev: 'tg', chapter: 1, verse: 5 },
  { abbrev: 'ef', chapter: 2, verse: 8 },
  { abbrev: 'dt', chapter: 31, verse: 6 },
  { abbrev: 'sl', chapter: 34, verse: 18 },
  { abbrev: '2tm', chapter: 1, verse: 7 },
]

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
}

export async function getVerseOfTheDay(version: string): Promise<VerseOfTheDay> {
  const ref = VOTD_REFERENCES[dayOfYear(new Date()) % VOTD_REFERENCES.length]
  const book = getBook(ref.abbrev)!
  const { verses } = await getChapter(version, ref.abbrev, ref.chapter)
  const verse = verses.find((v) => v.number === ref.verse) ?? verses[0]
  return {
    abbrev: ref.abbrev,
    bookName: book.name,
    chapter: ref.chapter,
    verse: verse.number,
    text: verse.text,
  }
}
