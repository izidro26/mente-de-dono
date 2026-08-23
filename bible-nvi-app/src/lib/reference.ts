import { BOOKS, type BibleBook } from '../data/books'

export interface ParsedReference {
  book: BibleBook
  chapter: number
  verseStart?: number
  verseEnd?: number
}

/** Normaliza texto removendo acentos, pontuação e caixa para comparação. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Sinônimos e abreviações comuns que apontam para a abreviação canônica do livro. */
const ALIASES: Record<string, string> = {}
for (const b of BOOKS) {
  const norm = normalize(b.name)
  ALIASES[norm] = b.abbrev
  ALIASES[normalize(b.abbrev)] = b.abbrev
  ALIASES[norm.replace(/\s+/g, '')] = b.abbrev
}
// Apelidos extras usados no dia a dia
Object.assign(ALIASES, {
  salmo: 'sl',
  salmos: 'sl',
  apocalipse: 'ap',
  ap: 'ap',
  atos: 'at',
  joao: 'jo',
  cantares: 'ct',
  canticodoscanticos: 'ct',
  provebios: 'pv',
  coriintios: '1co',
})

const BOOK_NAMES_SORTED = [...BOOKS]
  .map((b) => b.name)
  .sort((a, b) => b.length - a.length)

/**
 * Interpreta referências em linguagem natural como:
 * "Jo 3:16", "João 3.16", "1 Coríntios 13", "Salmos 23:1-6", "gn 1"
 */
export function parseReference(input: string): ParsedReference | null {
  const raw = input.trim()
  if (!raw) return null

  const match = raw.match(
    /^\s*((?:[123]\s?)?[A-Za-zÀ-ÿ.]+)\s*(\d+)?\s*(?:[:.\s](\d+)(?:\s*-\s*(\d+))?)?\s*$/,
  )
  if (!match) return null

  const [, rawBookPart, chapterStr, verseStartStr, verseEndStr] = match
  const key = normalize(rawBookPart.replace(/\./g, ''))
  let abbrev = ALIASES[key] ?? ALIASES[key.replace(/\s+/g, '')]

  if (!abbrev) {
    // tenta casar por prefixo (ex: "gene" -> "genesis")
    const found = BOOK_NAMES_SORTED.find((name) => normalize(name).startsWith(key))
    if (found) abbrev = ALIASES[normalize(found)]
  }
  if (!abbrev) return null

  const book = BOOKS.find((b) => b.abbrev === abbrev)
  if (!book) return null

  const chapter = chapterStr ? parseInt(chapterStr, 10) : 1
  if (chapter < 1 || chapter > book.chapters) return null

  return {
    book,
    chapter,
    verseStart: verseStartStr ? parseInt(verseStartStr, 10) : undefined,
    verseEnd: verseEndStr ? parseInt(verseEndStr, 10) : undefined,
  }
}

export function formatReference(bookName: string, chapter: number, verse?: number, verseEnd?: number): string {
  let ref = `${bookName} ${chapter}`
  if (verse) {
    ref += `:${verse}`
    if (verseEnd && verseEnd !== verse) ref += `-${verseEnd}`
  }
  return ref
}
