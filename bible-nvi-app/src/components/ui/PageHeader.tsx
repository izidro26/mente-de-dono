import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  action?: ReactNode
}

export function PageHeader({ title, subtitle, onBack, action }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur">
      {onBack !== undefined && (
        <button
          onClick={() => (onBack ? onBack() : navigate(-1))}
          aria-label="Voltar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-2"
        >
          <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
