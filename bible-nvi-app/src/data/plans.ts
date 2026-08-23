import { BOOKS, type BibleBook } from './books'

export interface ChapterRef {
  abbrev: string
  chapter: number
}

export interface ReadingPlan {
  id: string
  title: string
  description: string
  emoji: string
  days: ChapterRef[][]
}

function chaptersOf(books: BibleBook[]): ChapterRef[] {
  const refs: ChapterRef[] = []
  for (const book of books) {
    for (let c = 1; c <= book.chapters; c++) refs.push({ abbrev: book.abbrev, chapter: c })
  }
  return refs
}

/** Distribui uma lista de capítulos em N dias, o mais equilibrado possível. */
function distributeIntoDays(refs: ChapterRef[], numDays: number): ChapterRef[][] {
  const days: ChapterRef[][] = Array.from({ length: numDays }, () => [])
  const base = Math.floor(refs.length / numDays)
  const remainder = refs.length % numDays

  let cursor = 0
  for (let d = 0; d < numDays; d++) {
    const count = base + (d < remainder ? 1 : 0)
    days[d] = refs.slice(cursor, cursor + count)
    cursor += count
  }
  return days
}

function byAbbrev(...abbrevs: string[]): BibleBook[] {
  const set = new Set(abbrevs)
  return BOOKS.filter((b) => set.has(b.abbrev))
}

const evangelhos = byAbbrev('mt', 'mc', 'lc', 'jo')
const novoTestamento = BOOKS.filter((b) => b.testament === 'NT')
const bibliaToda = BOOKS
const sabedoria = byAbbrev('pv', 'ec')
const salmos = byAbbrev('sl')
const origens = byAbbrev('gn', 'ex')

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'evangelhos-30',
    title: 'Evangelhos em 30 dias',
    description: 'A vida de Jesus em Mateus, Marcos, Lucas e João.',
    emoji: '✝️',
    days: distributeIntoDays(chaptersOf(evangelhos), 30),
  },
  {
    id: 'nt-90',
    title: 'Novo Testamento em 90 dias',
    description: 'Todo o Novo Testamento em três meses, em ritmo leve.',
    emoji: '📖',
    days: distributeIntoDays(chaptersOf(novoTestamento), 90),
  },
  {
    id: 'biblia-365',
    title: 'A Bíblia em 1 ano',
    description: 'Do Gênesis ao Apocalipse, em ordem, um pouco a cada dia.',
    emoji: '🗓️',
    days: distributeIntoDays(chaptersOf(bibliaToda), 365),
  },
  {
    id: 'sabedoria-21',
    title: 'Sabedoria em 21 dias',
    description: 'Provérbios e Eclesiastes: discernimento para o dia a dia.',
    emoji: '💡',
    days: distributeIntoDays(chaptersOf(sabedoria), 21),
  },
  {
    id: 'salmos-30',
    title: 'Salmos em 30 dias',
    description: 'Louvor, lamento e confiança: todos os 150 salmos.',
    emoji: '🎵',
    days: distributeIntoDays(chaptersOf(salmos), 30),
  },
  {
    id: 'origens-14',
    title: 'Origens em 14 dias',
    description: 'Gênesis e Êxodo: criação, aliança e libertação.',
    emoji: '🌅',
    days: distributeIntoDays(chaptersOf(origens), 14),
  },
]

export function getPlan(id: string): ReadingPlan | undefined {
  return READING_PLANS.find((p) => p.id === id)
}

export function dayId(planId: string, dayIndex: number): string {
  return `${planId}:${dayIndex}`
}
