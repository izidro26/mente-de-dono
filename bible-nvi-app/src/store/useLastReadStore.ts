import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LastReadState {
  abbrev: string
  chapter: number
  updatedAt: number
  setLastRead: (abbrev: string, chapter: number) => void
}

export const useLastReadStore = create<LastReadState>()(
  persist(
    (set) => ({
      abbrev: 'jo',
      chapter: 1,
      updatedAt: 0,
      setLastRead: (abbrev, chapter) => set({ abbrev, chapter, updatedAt: Date.now() }),
    }),
    { name: 'verbo-last-read' },
  ),
)
