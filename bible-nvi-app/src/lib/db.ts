import Dexie, { type EntityTable } from 'dexie'

export interface CachedVerse {
  number: number
  text: string
}

export interface CachedChapter {
  /** `${version}:${abbrev}:${chapter}` */
  id: string
  version: string
  abbrev: string
  chapter: number
  verses: CachedVerse[]
  fetchedAt: number
}

export type HighlightColor = 'amber' | 'rose' | 'emerald' | 'sky' | 'violet'

export interface Highlight {
  id?: number
  version: string
  abbrev: string
  chapter: number
  verse: number
  color: HighlightColor
  createdAt: number
}

export interface Note {
  id?: number
  version: string
  abbrev: string
  chapter: number
  verse: number
  text: string
  createdAt: number
  updatedAt: number
}

export interface Bookmark {
  id?: number
  abbrev: string
  chapter: number
  verse?: number
  label?: string
  createdAt: number
}

export interface PlanProgress {
  /** id do plano */
  planId: string
  completedDayIds: string[]
  startedAt: number
  lastReadAt: number
}

export interface SrsCard {
  id?: number
  version: string
  abbrev: string
  chapter: number
  verseStart: number
  verseEnd: number
  text: string
  reference: string
  ease: number
  intervalDays: number
  reps: number
  dueAt: number
  createdAt: number
}

export interface ReadingLogEntry {
  /** data no formato YYYY-MM-DD (fuso local) */
  date: string
  chaptersRead: string[]
}

class VerboDatabase extends Dexie {
  chapters!: EntityTable<CachedChapter, 'id'>
  highlights!: EntityTable<Highlight, 'id'>
  notes!: EntityTable<Note, 'id'>
  bookmarks!: EntityTable<Bookmark, 'id'>
  planProgress!: EntityTable<PlanProgress, 'planId'>
  srsCards!: EntityTable<SrsCard, 'id'>
  readingLog!: EntityTable<ReadingLogEntry, 'date'>

  constructor() {
    super('verbo-bible-db')
    this.version(1).stores({
      chapters: 'id, version, abbrev, chapter',
      highlights: '++id, [version+abbrev+chapter], version, abbrev, chapter, verse, createdAt',
      notes: '++id, [version+abbrev+chapter], version, abbrev, chapter, verse, createdAt',
      bookmarks: '++id, abbrev, chapter, createdAt',
      planProgress: 'planId',
      srsCards: '++id, dueAt, abbrev',
      readingLog: 'date',
    })
  }
}

export const db = new VerboDatabase()

export function chapterKey(version: string, abbrev: string, chapter: number): string {
  return `${version}:${abbrev}:${chapter}`
}

export async function markChapterRead(abbrev: string, chapter: number): Promise<void> {
  const today = new Date()
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`
  const ref = `${abbrev}-${chapter}`
  const existing = await db.readingLog.get(date)
  if (existing) {
    if (!existing.chaptersRead.includes(ref)) {
      existing.chaptersRead.push(ref)
      await db.readingLog.put(existing)
    }
  } else {
    await db.readingLog.put({ date, chaptersRead: [ref] })
  }
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Calcula a sequência atual de dias consecutivos com leitura registrada. */
export async function getCurrentStreak(): Promise<number> {
  const entries = await db.readingLog.toArray()
  if (entries.length === 0) return 0
  const dates = new Set(entries.map((e) => e.date))

  const cursor = new Date()
  if (!dates.has(dateKey(cursor))) {
    // permite que "hoje" ainda não tenha leitura sem quebrar a sequência de ontem
    cursor.setDate(cursor.getDate() - 1)
    if (!dates.has(dateKey(cursor))) return 0
  }

  let streak = 0
  while (dates.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
