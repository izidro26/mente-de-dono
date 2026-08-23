import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useOnlineStatus } from '../../lib/useOnlineStatus'

export function Layout() {
  const online = useOnlineStatus()

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      {!online && (
        <div className="bg-accent-soft px-4 py-1.5 text-center text-xs font-medium text-accent">
          Você está offline — mostrando conteúdo já baixado.
        </div>
      )}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
