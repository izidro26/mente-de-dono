import { getBook } from '../data/books'
import type { ChapterRef } from '../data/plans'

/** Formata os capítulos de um dia do plano em texto legível, ex: "Gênesis 1-3" ou "Salmos 5, 6". */
export function formatDayRefs(refs: ChapterRef[]): string {
  if (refs.length === 0) return ''
  const parts: string[] = []
  let runStart = refs[0]
  let runEnd = refs[0]

  const flush = () => {
    const book = getBook(runStart.abbrev)
    const name = book?.name ?? runStart.abbrev
    if (runStart.abbrev === runEnd.abbrev && runStart.chapter === runEnd.chapter) {
      parts.push(`${name} ${runStart.chapter}`)
    } else if (runStart.abbrev === runEnd.abbrev) {
      parts.push(`${name} ${runStart.chapter}-${runEnd.chapter}`)
    } else {
      const endBook = getBook(runEnd.abbrev)
      parts.push(`${name} ${runStart.chapter} – ${endBook?.name ?? runEnd.abbrev} ${runEnd.chapter}`)
    }
  }

  for (let i = 1; i < refs.length; i++) {
    const ref = refs[i]
    const sameBookNext = ref.abbrev === runEnd.abbrev && ref.chapter === runEnd.chapter + 1
    const nextBookFirstChapter = ref.abbrev !== runEnd.abbrev && ref.chapter === 1
    if (sameBookNext || nextBookFirstChapter) {
      runEnd = ref
    } else {
      flush()
      runStart = ref
      runEnd = ref
    }
  }
  flush()

  return parts.join(', ')
}
