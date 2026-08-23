import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_AI_MODEL } from '../lib/ai'

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'system'
export type FontSize = 'sm' | 'md' | 'lg' | 'xl'

interface SettingsState {
  theme: ThemeMode
  fontSize: FontSize
  version: string
  secondaryVersion: string | null
  compareTranslations: boolean
  apiBase: string
  apiToken: string
  aiApiKey: string
  aiModel: string
  ttsRate: number
  setTheme: (t: ThemeMode) => void
  setFontSize: (f: FontSize) => void
  setVersion: (v: string) => void
  setSecondaryVersion: (v: string | null) => void
  setCompareTranslations: (v: boolean) => void
  setApiBase: (v: string) => void
  setApiToken: (v: string) => void
  setAiApiKey: (v: string) => void
  setAiModel: (v: string) => void
  setTtsRate: (v: number) => void
}

export const AVAILABLE_VERSIONS = [
  { code: 'nvi', label: 'NVI — Nova Versão Internacional' },
  { code: 'acf', label: 'ACF — Almeida Corrigida Fiel' },
  { code: 'ra', label: 'ARA — Almeida Revista e Atualizada' },
  { code: 'kjv', label: 'KJV — King James Version (EN)' },
]

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 'md',
      version: 'nvi',
      secondaryVersion: null,
      compareTranslations: false,
      apiBase: 'https://www.abibliadigital.com.br/api',
      apiToken: '',
      aiApiKey: '',
      aiModel: DEFAULT_AI_MODEL,
      ttsRate: 1,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setVersion: (version) => set({ version }),
      setSecondaryVersion: (secondaryVersion) => set({ secondaryVersion }),
      setCompareTranslations: (compareTranslations) => set({ compareTranslations }),
      setApiBase: (apiBase) => set({ apiBase }),
      setApiToken: (apiToken) => set({ apiToken }),
      setAiApiKey: (aiApiKey) => set({ aiApiKey }),
      setAiModel: (aiModel) => set({ aiModel }),
      setTtsRate: (ttsRate) => set({ ttsRate }),
    }),
    { name: 'verbo-settings' },
  ),
)

export function applyThemeClass(theme: ThemeMode): void {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('sepia', resolved === 'sepia')
}

export const FONT_SIZE_PX: Record<FontSize, string> = {
  sm: '1rem',
  md: '1.15rem',
  lg: '1.35rem',
  xl: '1.6rem',
}
