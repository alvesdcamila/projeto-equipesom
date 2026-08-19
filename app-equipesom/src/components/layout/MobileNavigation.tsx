import { CalendarDays, FileText, House, Menu } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/propostas', label: 'Propostas', icon: FileText },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/mais', label: 'Mais', icon: Menu },
]

export function MobileNavigation() {
  return (
    <nav className="mobile-nav" aria-label="Navegação principal">
      {navigation.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? 'mobile-nav__item is-active' : 'mobile-nav__item'
          }
        >
          <Icon size={21} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
