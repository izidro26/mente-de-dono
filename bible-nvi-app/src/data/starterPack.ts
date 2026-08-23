import type { ChapterRef } from './plans'
import { getBook } from './books'

/**
 * Conjunto pequeno, mas útil, de capítulos baixados silenciosamente em
 * segundo plano assim que o app tem internet pela primeira vez — assim,
 * mesmo quem nunca abriu a tela de Downloads não fica "preso" sem
 * conseguir ler nada caso perca a conexão. O Evangelho de João inteiro
 * (a leitura inicial recomendada com mais frequência) mais alguns
 * capítulos muito buscados de consolo/sabedoria.
 */
export const STARTER_PACK: ChapterRef[] = [
  ...Array.from({ length: getBook('jo')!.chapters }, (_, i) => ({ abbrev: 'jo', chapter: i + 1 })),
  { abbrev: 'sl', chapter: 1 },
  { abbrev: 'sl', chapter: 23 },
  { abbrev: 'sl', chapter: 91 },
  { abbrev: 'sl', chapter: 121 },
  { abbrev: 'sl', chapter: 139 },
  { abbrev: 'pv', chapter: 3 },
  { abbrev: 'mt', chapter: 5 },
  { abbrev: 'mt', chapter: 6 },
  { abbrev: 'mt', chapter: 7 },
  { abbrev: 'rm', chapter: 8 },
  { abbrev: 'fp', chapter: 4 },
]
