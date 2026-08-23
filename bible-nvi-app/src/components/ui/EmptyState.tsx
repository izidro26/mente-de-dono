import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  )
}
