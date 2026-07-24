import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Fuel, ShoppingCart, Bell, BarChart3, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', label: 'Panel Principal', icon: LayoutDashboard },
  { to: '/dispensers', label: 'Surtidores', icon: Fuel },
  { to: '/pos', label: 'Ventas (POS)', icon: ShoppingCart },
  { to: '/alerts', label: 'Alertas', icon: Bell },
  { to: '/reports', label: 'Reportes', icon: BarChart3 },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const esAdmin = profile?.rol === 'admin'

  const items = esAdmin
    ? [...NAV_ITEMS, { to: '/audit', label: 'Auditoría', icon: ShieldCheck }]
    : NAV_ITEMS

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold">El Surtidor</h1>
        <p className="text-xs font-mono text-gray-400 uppercase">Cochabambino</p>
      </div>

      <nav className="flex-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 mb-1 rounded-md text-sm font-medium ${isActive
                  ? 'bg-gray-100 text-brand-red border-l-2 border-brand-red'
                  : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
          {profile?.nombre?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{profile?.nombre ?? 'Usuario'}</p>
          <p className="text-xs text-gray-400 capitalize">{profile?.rol ?? ''}</p>
        </div>
        <button onClick={signOut} className="text-xs text-gray-400 hover:text-brand-red">
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}