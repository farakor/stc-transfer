import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { Home, PlusCircle, ClipboardList, Wallet, MessageCircle, User } from 'lucide-react'
import STCLogo from '@/assets/STC-transfer.png'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

export function ClientLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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

  // Вычисляем активный индекс напрямую из текущего пути
  const activeIndex = menuItems.findIndex(item => isActive(item.path))
  const validActiveIndex = activeIndex !== -1 ? activeIndex : 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-[35px] z-20 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={STCLogo} 
                alt="STC Transfer" 
                className="h-8 w-auto select-none" 
                style={{
                  imageRendering: 'auto'
                }}
              />
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24 safe-area-bottom sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar - Liquid Glass Effect */}
      <nav className="fixed bottom-8 left-0 right-0 z-10 px-4 safe-area-bottom">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative overflow-hidden rounded-3xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 0 80px 0 rgba(59, 130, 246, 0.1)'
            }}
          >
            {/* Glass shine effect */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(255, 255, 255, 0.2) 100%)'
              }}
            />
            
            {/* Navigation items */}
            <div className="relative flex items-center px-1 py-1">
              {/* Sliding active indicator */}
              <div 
                className="absolute rounded-2xl bg-blue-600"
                style={{
                  left: `calc(${validActiveIndex * 20}% + 4px)`,
                  width: 'calc(20% - 8px)',
                  height: 'calc(100% - 8px)',
                  top: '4px',
                  zIndex: 1,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'left'
                }}
                data-active-index={validActiveIndex}
              />
              
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                const hovered = hoveredItem === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative flex flex-col items-center justify-center py-3 px-1 flex-1 group transition-all duration-300"
                    style={{ zIndex: 2 }}
                  >
                    {/* Hover background glow (только для неактивных) */}
                    {!active && hovered && (
                      <div 
                        className="absolute rounded-2xl opacity-0 group-hover:opacity-70 transition-all duration-500"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 197, 253, 0.1))',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
                          top: '4px',
                          bottom: '4px',
                          left: '6px',
                          right: '6px'
                        }}
                      />
                    )}
                    
                    {/* Icon with liquid animation */}
                    <div className={`relative z-10 transition-all duration-500 ${
                      active 
                        ? 'scale-100 transform' 
                        : hovered 
                          ? 'scale-105 -translate-y-1' 
                          : 'scale-100'
                    }`}>
                      <Icon 
                        className={`w-6 h-6 mb-1 transition-all duration-300 ${
                          active
                            ? 'text-white'
                            : 'text-gray-600 group-hover:text-blue-500'
                        }`}
                      />
                    </div>
                    
                    {/* Label */}
                    <span 
                      className={`relative z-10 text-xs font-medium transition-all duration-300 ${
                        active
                          ? 'text-white font-semibold'
                          : 'text-gray-700 group-hover:text-blue-600'
                      }`}
                    >
                      {item.label}
                    </span>
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

