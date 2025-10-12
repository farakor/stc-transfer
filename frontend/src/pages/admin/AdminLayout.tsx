import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  Car,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  DollarSign,
  Shield
} from 'lucide-react';
import Logo from '@/assets/STC-transfer.svg';
import FarukBadge from '@/assets/faruk-badge.svg';
import { AuthService, Admin } from '@/services/authService';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'bookings' | 'drivers' | 'vehicles' | 'users' | 'tariffs' | 'settings' | 'admins';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Загрузка профиля администратора
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!AuthService.isAuthenticated()) {
          navigate('/admin/login');
          return;
        }
        
        const profile = await AuthService.getProfile();
        setAdmin(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Если токен невалиден, перенаправляем на страницу входа
        AuthService.logout();
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // Функция выхода из системы
  const handleLogout = () => {
    AuthService.logout();
    navigate('/admin/login');
  };

  // Получить первую букву имени для аватара
  const getInitials = () => {
    if (!admin) return '?';
    const firstName = admin.firstName || '';
    const lastName = admin.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || '?';
  };

  // Получить отображаемое имя роли
  const getRoleLabel = () => {
    if (!admin) return '';
    const roleLabels: Record<string, string> = {
      SUPER_ADMIN: 'Суперадминистратор',
      ADMIN: 'Администратор',
      MANAGER: 'Менеджер',
      OPERATOR: 'Оператор'
    };
    return roleLabels[admin.role] || admin.role;
  };

  const navigation = [
    {
      name: 'Панель управления',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      key: 'dashboard'
    },
    {
      name: 'Заказы',
      href: '/admin/bookings',
      icon: Calendar,
      key: 'bookings'
    },
    {
      name: 'Водители',
      href: '/admin/drivers',
      icon: UserCheck,
      key: 'drivers'
    },
    {
      name: 'Транспорт',
      href: '/admin/vehicles',
      icon: Car,
      key: 'vehicles'
    },
    {
      name: 'Клиенты',
      href: '/admin/users',
      icon: Users,
      key: 'users'
    },
    {
      name: 'Тарифы',
      href: '/admin/tariffs',
      icon: DollarSign,
      key: 'tariffs'
    },
    {
      name: 'Администраторы',
      href: '/admin/admins',
      icon: Shield,
      key: 'admins'
    },
    {
      name: 'Настройки',
      href: '/admin/settings',
      icon: Settings,
      key: 'settings'
    }
  ];

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Мобильное меню */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} currentPage={currentPage} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Десктопное меню */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent navigation={navigation} currentPage={currentPage} onLogout={handleLogout} />
      </div>

      {/* Основной контент */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Верхняя панель */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Поиск..."
                    type="search"
                  />
                </div>
              </div>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Bell className="h-6 w-6" />
                <span className="sr-only">Уведомления</span>
              </button>

              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {loading ? '...' : getInitials()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">
                      {loading ? 'Загрузка...' : `${admin?.firstName || ''} ${admin?.lastName || ''}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {loading ? '' : getRoleLabel()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    key: string;
  }>;
  currentPage: string;
  onLogout: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, currentPage, onLogout }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-2">
          <div className="w-full">
            <img src={Logo} alt="STC Transfer" className="w-full h-auto max-h-12" />
          </div>
        </div>

        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = currentPage === item.key;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`${isActive
                  ? 'bg-blue-100 border-blue-500 text-blue-700 border-r-2'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <item.icon
                  className={`${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4 space-y-3">
        <button 
          onClick={onLogout}
          className="flex items-center w-full group hover:bg-red-50 rounded-md p-2 transition-colors"
        >
          <div className="flex items-center">
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-red-600">Выйти</p>
            </div>
          </div>
        </button>
        
        <div className="border-t border-gray-200 pt-3 -mx-4 px-4">
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 mb-2">Developed by</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
