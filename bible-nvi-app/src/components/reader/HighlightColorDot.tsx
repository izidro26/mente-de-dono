import type { HighlightColor } from '../../lib/db'

export const HIGHLIGHT_COLORS: { id: HighlightColor; bg: string; label: string }[] = [
  { id: 'amber', bg: '#f5b73f', label: 'Âmbar' },
  { id: 'rose', bg: '#f472a0', label: 'Rosa' },
  { id: 'emerald', bg: '#34d399', label: 'Verde' },
  { id: 'sky', bg: '#38bdf8', label: 'Azul' },
  { id: 'violet', bg: '#a78bfa', label: 'Violeta' },
]

export const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  amber: 'rgba(245,183,63,0.28)',
  rose: 'rgba(244,114,160,0.24)',
  emerald: 'rgba(52,211,153,0.24)',
  sky: 'rgba(56,189,248,0.24)',
  violet: 'rgba(167,139,250,0.24)',
}
