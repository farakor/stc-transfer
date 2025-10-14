import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { Home, PlusCircle, ClipboardList, Wallet, MessageCircle, Car, User } from 'lucide-react'

interface ClientLayoutProps {
  children: ReactNode
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: t.menu.dashboard,
      icon: Home,
      path: '/client/dashboard'
    },
    {
      id: 'new-booking',
      label: t.menu.newBooking,
      icon: PlusCircle,
      path: '/vehicles'
    },
    {
      id: 'history',
      label: t.menu.history,
      icon: ClipboardList,
      path: '/client/history'
    },
    {
      id: 'tariffs',
      label: t.menu.tariffs,
      icon: Wallet,
      path: '/client/tariffs'
    },
    {
      id: 'support',
      label: t.menu.support,
      icon: MessageCircle,
      path: '/client/support'
    }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">STC Transfer</h1>
            </div>
            <button
              onClick={() => {
                // Здесь можно добавить логику выхода
                console.log('Profile clicked')
              }}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-8 left-0 right-0 z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
            <div className="flex justify-around items-center px-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`
                      flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors
                      ${isActive(item.path)
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

