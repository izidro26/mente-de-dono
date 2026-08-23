import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: (active: boolean) => React.ReactNode
}

function Icon({ d, active }: { d: string; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

const items: NavItem[] = [
  {
    to: '/',
    label: 'Hoje',
    icon: (a) => <Icon active={a} d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M12 8a4 4 0 100 8 4 4 0 000-8z" />,
  },
  {
    to: '/ler',
    label: 'Ler',
    icon: (a) => <Icon active={a} d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 014 18.5v-13zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 001.5-1.5v-13z" />,
  },
  {
    to: '/buscar',
    label: 'Buscar',
    icon: (a) => <Icon active={a} d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" />,
  },
  {
    to: '/planos',
    label: 'Planos',
    icon: (a) => <Icon active={a} d="M4 5h16M4 5v14a1 1 0 001 1h14a1 1 0 001-1V5M4 5l1.5-2h13L20 5M9 10h6M9 14h6" />,
  },
  {
    to: '/notas',
    label: 'Notas',
    icon: (a) => <Icon active={a} d="M4 4h13l3 3v13a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zM14 4v5h5M8 13h8M8 17h5" />,
  },
  {
    to: '/estudos',
    label: 'Estudos',
    icon: (a) => <Icon active={a} d="M12 4L3 9l9 5 9-5-9-5zM6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M20 9v6" />,
  },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-1">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon(isActive)}
                  <span className="leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
