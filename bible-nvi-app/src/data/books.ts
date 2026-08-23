/**
 * Metadados estruturais dos 66 livros da Bíblia (nomes, abreviações e
 * número de capítulos). Isso é informação estrutural, não o texto bíblico
 * em si, então não há qualquer questão de direitos autorais aqui — o texto
 * de cada versículo é obtido em tempo real do provedor configurado
 * (ver src/lib/bibleProvider.ts).
 *
 * As abreviações seguem o padrão usado pela API "A Bíblia Digital"
 * (abibliadigital.com.br), o provedor padrão do app.
 */

export type Testament = 'AT' | 'NT'

export type BookGroup =
  | 'Pentateuco'
  | 'Históricos'
  | 'Poéticos'
  | 'Profetas Maiores'
  | 'Profetas Menores'
  | 'Evangelhos'
  | 'História'
  | 'Cartas Paulinas'
  | 'Cartas Gerais'
  | 'Apocalíptico'

export interface BibleBook {
  /** Abreviação usada pelo provedor de dados (ex: "gn", "jo", "1co") */
  abbrev: string
  name: string
  testament: Testament
  group: BookGroup
  chapters: number
}

export const BOOKS: BibleBook[] = [
  // Pentateuco
  { abbrev: 'gn', name: 'Gênesis', testament: 'AT', group: 'Pentateuco', chapters: 50 },
  { abbrev: 'ex', name: 'Êxodo', testament: 'AT', group: 'Pentateuco', chapters: 40 },
  { abbrev: 'lv', name: 'Levítico', testament: 'AT', group: 'Pentateuco', chapters: 27 },
  { abbrev: 'nm', name: 'Números', testament: 'AT', group: 'Pentateuco', chapters: 36 },
  { abbrev: 'dt', name: 'Deuteronômio', testament: 'AT', group: 'Pentateuco', chapters: 34 },
  // Históricos
  { abbrev: 'js', name: 'Josué', testament: 'AT', group: 'Históricos', chapters: 24 },
  { abbrev: 'jz', name: 'Juízes', testament: 'AT', group: 'Históricos', chapters: 21 },
  { abbrev: 'rt', name: 'Rute', testament: 'AT', group: 'Históricos', chapters: 4 },
  { abbrev: '1sm', name: '1 Samuel', testament: 'AT', group: 'Históricos', chapters: 31 },
  { abbrev: '2sm', name: '2 Samuel', testament: 'AT', group: 'Históricos', chapters: 24 },
  { abbrev: '1rs', name: '1 Reis', testament: 'AT', group: 'Históricos', chapters: 22 },
  { abbrev: '2rs', name: '2 Reis', testament: 'AT', group: 'Históricos', chapters: 25 },
  { abbrev: '1cr', name: '1 Crônicas', testament: 'AT', group: 'Históricos', chapters: 29 },
  { abbrev: '2cr', name: '2 Crônicas', testament: 'AT', group: 'Históricos', chapters: 36 },
  { abbrev: 'ed', name: 'Esdras', testament: 'AT', group: 'Históricos', chapters: 10 },
  { abbrev: 'ne', name: 'Neemias', testament: 'AT', group: 'Históricos', chapters: 13 },
  { abbrev: 'et', name: 'Ester', testament: 'AT', group: 'Históricos', chapters: 10 },
  // Poéticos
  { abbrev: 'job', name: 'Jó', testament: 'AT', group: 'Poéticos', chapters: 42 },
  { abbrev: 'sl', name: 'Salmos', testament: 'AT', group: 'Poéticos', chapters: 150 },
  { abbrev: 'pv', name: 'Provérbios', testament: 'AT', group: 'Poéticos', chapters: 31 },
  { abbrev: 'ec', name: 'Eclesiastes', testament: 'AT', group: 'Poéticos', chapters: 12 },
  { abbrev: 'ct', name: 'Cânticos', testament: 'AT', group: 'Poéticos', chapters: 8 },
  // Profetas Maiores
  { abbrev: 'is', name: 'Isaías', testament: 'AT', group: 'Profetas Maiores', chapters: 66 },
  { abbrev: 'jr', name: 'Jeremias', testament: 'AT', group: 'Profetas Maiores', chapters: 52 },
  { abbrev: 'lm', name: 'Lamentações', testament: 'AT', group: 'Profetas Maiores', chapters: 5 },
  { abbrev: 'ez', name: 'Ezequiel', testament: 'AT', group: 'Profetas Maiores', chapters: 48 },
  { abbrev: 'dn', name: 'Daniel', testament: 'AT', group: 'Profetas Maiores', chapters: 12 },
  // Profetas Menores
  { abbrev: 'os', name: 'Oséias', testament: 'AT', group: 'Profetas Menores', chapters: 14 },
  { abbrev: 'jl', name: 'Joel', testament: 'AT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'am', name: 'Amós', testament: 'AT', group: 'Profetas Menores', chapters: 9 },
  { abbrev: 'ob', name: 'Obadias', testament: 'AT', group: 'Profetas Menores', chapters: 1 },
  { abbrev: 'jn', name: 'Jonas', testament: 'AT', group: 'Profetas Menores', chapters: 4 },
  { abbrev: 'mq', name: 'Miquéias', testament: 'AT', group: 'Profetas Menores', chapters: 7 },
  { abbrev: 'na', name: 'Naum', testament: 'AT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'hc', name: 'Habacuque', testament: 'AT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'sf', name: 'Sofonias', testament: 'AT', group: 'Profetas Menores', chapters: 3 },
  { abbrev: 'ag', name: 'Ageu', testament: 'AT', group: 'Profetas Menores', chapters: 2 },
  { abbrev: 'zc', name: 'Zacarias', testament: 'AT', group: 'Profetas Menores', chapters: 14 },
  { abbrev: 'ml', name: 'Malaquias', testament: 'AT', group: 'Profetas Menores', chapters: 4 },
  // Evangelhos
  { abbrev: 'mt', name: 'Mateus', testament: 'NT', group: 'Evangelhos', chapters: 28 },
  { abbrev: 'mc', name: 'Marcos', testament: 'NT', group: 'Evangelhos', chapters: 16 },
  { abbrev: 'lc', name: 'Lucas', testament: 'NT', group: 'Evangelhos', chapters: 24 },
  { abbrev: 'jo', name: 'João', testament: 'NT', group: 'Evangelhos', chapters: 21 },
  // História
  { abbrev: 'at', name: 'Atos', testament: 'NT', group: 'História', chapters: 28 },
  // Cartas Paulinas
  { abbrev: 'rm', name: 'Romanos', testament: 'NT', group: 'Cartas Paulinas', chapters: 16 },
  { abbrev: '1co', name: '1 Coríntios', testament: 'NT', group: 'Cartas Paulinas', chapters: 16 },
  { abbrev: '2co', name: '2 Coríntios', testament: 'NT', group: 'Cartas Paulinas', chapters: 13 },
  { abbrev: 'gl', name: 'Gálatas', testament: 'NT', group: 'Cartas Paulinas', chapters: 6 },
  { abbrev: 'ef', name: 'Efésios', testament: 'NT', group: 'Cartas Paulinas', chapters: 6 },
  { abbrev: 'fp', name: 'Filipenses', testament: 'NT', group: 'Cartas Paulinas', chapters: 4 },
  { abbrev: 'cl', name: 'Colossenses', testament: 'NT', group: 'Cartas Paulinas', chapters: 4 },
  { abbrev: '1ts', name: '1 Tessalonicenses', testament: 'NT', group: 'Cartas Paulinas', chapters: 5 },
  { abbrev: '2ts', name: '2 Tessalonicenses', testament: 'NT', group: 'Cartas Paulinas', chapters: 3 },
  { abbrev: '1tm', name: '1 Timóteo', testament: 'NT', group: 'Cartas Paulinas', chapters: 6 },
  { abbrev: '2tm', name: '2 Timóteo', testament: 'NT', group: 'Cartas Paulinas', chapters: 4 },
  { abbrev: 'tt', name: 'Tito', testament: 'NT', group: 'Cartas Paulinas', chapters: 3 },
  { abbrev: 'fm', name: 'Filemom', testament: 'NT', group: 'Cartas Paulinas', chapters: 1 },
  // Cartas Gerais
  { abbrev: 'hb', name: 'Hebreus', testament: 'NT', group: 'Cartas Gerais', chapters: 13 },
  { abbrev: 'tg', name: 'Tiago', testament: 'NT', group: 'Cartas Gerais', chapters: 5 },
  { abbrev: '1pe', name: '1 Pedro', testament: 'NT', group: 'Cartas Gerais', chapters: 5 },
  { abbrev: '2pe', name: '2 Pedro', testament: 'NT', group: 'Cartas Gerais', chapters: 3 },
  { abbrev: '1jo', name: '1 João', testament: 'NT', group: 'Cartas Gerais', chapters: 5 },
  { abbrev: '2jo', name: '2 João', testament: 'NT', group: 'Cartas Gerais', chapters: 1 },
  { abbrev: '3jo', name: '3 João', testament: 'NT', group: 'Cartas Gerais', chapters: 1 },
  { abbrev: 'jd', name: 'Judas', testament: 'NT', group: 'Cartas Gerais', chapters: 1 },
  // Apocalíptico
  { abbrev: 'ap', name: 'Apocalipse', testament: 'NT', group: 'Apocalíptico', chapters: 22 },
]

export const BOOKS_BY_ABBREV: Record<string, BibleBook> = Object.fromEntries(
  BOOKS.map((b) => [b.abbrev, b]),
)

export function getBook(abbrev: string): BibleBook | undefined {
  return BOOKS_BY_ABBREV[abbrev.toLowerCase()]
}

export function nextChapterRef(abbrev: string, chapter: number): { abbrev: string; chapter: number } | null {
  const book = getBook(abbrev)
  if (!book) return null
  if (chapter < book.chapters) return { abbrev, chapter: chapter + 1 }
  const idx = BOOKS.findIndex((b) => b.abbrev === abbrev)
  const next = BOOKS[idx + 1]
  return next ? { abbrev: next.abbrev, chapter: 1 } : null
}

export function prevChapterRef(abbrev: string, chapter: number): { abbrev: string; chapter: number } | null {
  const book = getBook(abbrev)
  if (!book) return null
  if (chapter > 1) return { abbrev, chapter: chapter - 1 }
  const idx = BOOKS.findIndex((b) => b.abbrev === abbrev)
  const prev = BOOKS[idx - 1]
  return prev ? { abbrev: prev.abbrev, chapter: prev.chapters } : null
}
