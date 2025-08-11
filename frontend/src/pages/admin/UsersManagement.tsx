import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  User,
  Phone,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  RefreshCw,
  Eye,
  X,
  Users as UsersIcon,
  Star,
  MessageSquare,
  DollarSign,
  Activity
} from 'lucide-react';

interface UserData {
  id: number;
  telegram_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  name?: string;
  phone?: string;
  language_code: string;
  created_at: string;
  updated_at: string;
  bookings?: BookingData[];
  stats?: {
    totalBookings: number;
    totalSpent: number;
    completedBookings: number;
    cancelledBookings: number;
    avgRating?: number;
    lastBookingDate?: string;
  };
}

interface BookingData {
  id: string;
  from_location: string;
  to_location: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  pickup_time?: string;
  vehicle?: {
    brand: string;
    model: string;
    type: string;
  };
  driver?: {
    name: string;
    phone: string;
  };
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'bookings_count' | 'total_spent' | 'last_booking'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('👥 Загружаем пользователей...');

      const response = await fetch('/api/admin/users');
      const data = await response.json();

      console.log('📦 Получены пользователи:', data);

      if (data.success && data.data) {
        // Преобразуем данные API в формат компонента
        const apiUsers: UserData[] = data.data.map((apiUser: any) => ({
          id: parseInt(apiUser.id),
          telegram_id: apiUser.telegramId,
          first_name: apiUser.firstName || null,
          last_name: apiUser.lastName || null,
          name: apiUser.name,
          phone: apiUser.phone,
          language_code: apiUser.language || 'ru',
          created_at: apiUser.createdAt,
          updated_at: apiUser.updatedAt || apiUser.createdAt,
          stats: {
            totalBookings: apiUser.totalBookings || 0,
            totalSpent: apiUser.totalSpent || 0,
            completedBookings: apiUser.completedBookings || 0,
            cancelledBookings: apiUser.cancelledBookings || 0,
            avgRating: apiUser.avgRating,
            lastBookingDate: apiUser.recentBookings && apiUser.recentBookings.length > 0
              ? apiUser.recentBookings[0].createdAt
              : undefined
          }
        }));

        setUsers(apiUsers);
        console.log(`✅ Загружено ${apiUsers.length} пользователей из API`);
      } else {
        console.error('❌ API пользователей вернул ошибку:', data.error);
        // Заглушка для демонстрации, если API не работает
        const mockUsers: UserData[] = [
          {
            id: 1,
            telegram_id: '123456789',
            first_name: 'Азиз',
            last_name: 'Рахимов',
            name: 'Азиз Рахимов',
            username: 'aziz_r',
            phone: '+998 90 123 45 67',
            language_code: 'ru',
            created_at: '2025-01-10T08:30:00Z',
            updated_at: '2025-01-15T14:20:00Z',
            stats: {
              totalBookings: 15,
              totalSpent: 450000,
              completedBookings: 12,
              cancelledBookings: 1,
              avgRating: 4.8,
              lastBookingDate: '2025-01-15T14:20:00Z'
            }
          },
          {
            id: 2,
            telegram_id: '987654321',
            first_name: 'Динара',
            last_name: 'Каримова',
            name: 'Динара Каримова',
            username: 'dinara_k',
            phone: '+998 91 234 56 78',
            language_code: 'ru',
            created_at: '2025-01-12T10:15:00Z',
            updated_at: '2025-01-14T16:45:00Z',
            stats: {
              totalBookings: 8,
              totalSpent: 240000,
              completedBookings: 7,
              cancelledBookings: 0,
              avgRating: 5.0,
              lastBookingDate: '2025-01-14T16:45:00Z'
            }
          },
          {
            id: 3,
            telegram_id: '555777999',
            first_name: 'Фарход',
            last_name: 'Усманов',
            name: 'Фарход Усманов',
            phone: '+998 93 345 67 89',
            language_code: 'uz',
            created_at: '2025-01-08T12:00:00Z',
            updated_at: '2025-01-13T09:30:00Z',
            stats: {
              totalBookings: 25,
              totalSpent: 750000,
              completedBookings: 20,
              cancelledBookings: 2,
              avgRating: 4.6,
              lastBookingDate: '2025-01-13T09:30:00Z'
            }
          },
          {
            id: 4,
            telegram_id: '111222333',
            first_name: 'Севара',
            last_name: 'Холматова',
            name: 'Севара Холматова',
            username: 'sevara_h',
            phone: '+998 94 456 78 90',
            language_code: 'ru',
            created_at: '2025-01-05T15:45:00Z',
            updated_at: '2025-01-11T11:20:00Z',
            stats: {
              totalBookings: 3,
              totalSpent: 90000,
              completedBookings: 3,
              cancelledBookings: 0,
              avgRating: 4.3,
              lastBookingDate: '2025-01-11T11:20:00Z'
            }
          }
        ];
        setUsers(mockUsers);
        console.log('✅ Загружены тестовые пользователи');
      }
    } catch (error) {
      console.error('❌ Ошибка при получении пользователей:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      console.log(`👤 Загружаем детали пользователя ${userId}...`);

      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success && data.data) {
        // Преобразуем данные API в формат компонента
        const apiUserDetails = {
          ...data.data,
          id: parseInt(data.data.id),
          telegram_id: data.data.telegramId,
          first_name: data.data.firstName || null,
          last_name: data.data.lastName || null,
          language_code: data.data.language || 'ru',
          created_at: data.data.createdAt,
          updated_at: data.data.updatedAt || data.data.createdAt,
          bookings: data.data.bookings ? data.data.bookings.map((booking: any) => ({
            id: booking.id,
            from_location: booking.fromLocation,
            to_location: booking.toLocation,
            price: booking.price,
            status: booking.status,
            created_at: booking.createdAt,
            pickup_time: booking.pickupTime,
            vehicle: booking.vehicle,
            driver: booking.driver
          })) : [],
          stats: {
            totalBookings: data.data.totalBookings || 0,
            totalSpent: data.data.totalSpent || 0,
            completedBookings: data.data.completedBookings || 0,
            cancelledBookings: data.data.cancelledBookings || 0,
            avgRating: data.data.avgRating,
            lastBookingDate: data.data.recentBookings && data.data.recentBookings.length > 0
              ? data.data.recentBookings[0].createdAt
              : undefined
          }
        };

        setSelectedUser(apiUserDetails);
        setShowUserModal(true);
        console.log('✅ Детали пользователя загружены из API');
      } else {
        console.warn('❌ Детали пользователя не найдены, используем заглушку');
        // Заглушка для демонстрации, если API не работает
        const mockBookings: BookingData[] = [
          {
            id: 'booking_1',
            from_location: 'Самарканд',
            to_location: 'Ташкент',
            price: 150000,
            status: 'COMPLETED',
            created_at: '2025-01-15T14:20:00Z',
            pickup_time: '2025-01-15T16:00:00Z',
            vehicle: {
              brand: 'Hongqi',
              model: 'EHS5',
              type: 'SEDAN'
            },
            driver: {
              name: 'Ибрагим Азизов',
              phone: '+998 90 123 45 67'
            }
          },
          {
            id: 'booking_2',
            from_location: 'Ташкент',
            to_location: 'Бухара',
            price: 180000,
            status: 'COMPLETED',
            created_at: '2025-01-12T10:30:00Z',
            pickup_time: '2025-01-12T14:00:00Z',
            vehicle: {
              brand: 'Kia',
              model: 'Carnival',
              type: 'MINIVAN'
            },
            driver: {
              name: 'Азиз Рахимов',
              phone: '+998 91 234 56 78'
            }
          },
          {
            id: 'booking_3',
            from_location: 'Бухара',
            to_location: 'Самарканд',
            price: 120000,
            status: 'CANCELLED',
            created_at: '2025-01-10T08:15:00Z'
          }
        ];

        const userWithBookings = {
          ...users.find(u => u.id === userId)!,
          bookings: mockBookings
        };

        setSelectedUser(userWithBookings);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('❌ Ошибка при получении деталей пользователя:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Завершен';
      case 'CONFIRMED': return 'Подтвержден';
      case 'IN_PROGRESS': return 'В пути';
      case 'PENDING': return 'Ожидает';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  const getUserDisplayName = (user: UserData) => {
    if (user.name) return user.name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.username) return `@${user.username}`;
    return `ID: ${user.telegram_id}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    return `${Math.floor(diffDays / 30)} мес. назад`;
  };

  const filteredUsers = users.filter(user => {
    const searchMatch =
      getUserDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telegram_id.includes(searchTerm);

    if (!searchMatch) return false;

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const now = new Date();
      const userDate = new Date(user.created_at);

      switch (dateFilter) {
        case 'today':
          return userDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return userDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return userDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return userDate >= yearAgo;
      }
    }

    return true;
  });

  // Сортировка
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'bookings_count':
        aValue = a.stats?.totalBookings || 0;
        bValue = b.stats?.totalBookings || 0;
        break;
      case 'total_spent':
        aValue = a.stats?.totalSpent || 0;
        bValue = b.stats?.totalSpent || 0;
        break;
      case 'last_booking':
        aValue = a.stats?.lastBookingDate ? new Date(a.stats.lastBookingDate) : new Date(0);
        bValue = b.stats?.lastBookingDate ? new Date(b.stats.lastBookingDate) : new Date(0);
        break;
      default:
        aValue = a.created_at;
        bValue = b.created_at;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.stats?.lastBookingDate &&
      new Date(u.stats.lastBookingDate).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length,
    totalRevenue: users.reduce((sum, u) => sum + (u.stats?.totalSpent || 0), 0),
    avgBookingsPerUser: users.length > 0 ?
      users.reduce((sum, u) => sum + (u.stats?.totalBookings || 0), 0) / users.length : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-gray-600 mt-1">Клиентская база и история заказов</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего клиентов</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalUsers}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активные (30 дней)</p>
              <p className="text-2xl font-bold text-green-600">{totalStats.activeUsers}</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalStats.totalRevenue)} сум</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Среднее заказов</p>
              <p className="text-2xl font-bold text-orange-600">{totalStats.avgBookingsPerUser.toFixed(1)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени, телефону, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все время</option>
              <option value="today">Сегодня</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
              <option value="year">Год</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">По дате регистрации</option>
              <option value="bookings_count">По количеству заказов</option>
              <option value="total_spent">По сумме заказов</option>
              <option value="last_booking">По последнему заказу</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Клиент</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Контакты</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Статистика</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Последний заказ</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Регистрация</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{getUserDisplayName(user)}</div>
                        <div className="text-sm text-gray-600">
                          {user.username && `@${user.username} • `}
                          ID: {user.telegram_id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Язык: {user.language_code.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.phone ? (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.phone}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Не указан</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-900">
                          {user.stats?.totalBookings || 0} заказов
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {formatCurrency(user.stats?.totalSpent || 0)} сум
                      </div>
                      {user.stats?.avgRating && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="w-3 h-3 mr-1 text-yellow-500" />
                          {user.stats.avgRating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.stats?.lastBookingDate ? (
                      <div className="text-sm">
                        <div className="text-gray-900">{getRelativeTime(user.stats.lastBookingDate)}</div>
                        <div className="text-gray-500">{formatDate(user.stats.lastBookingDate)}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Нет заказов</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="text-gray-900">{getRelativeTime(user.created_at)}</div>
                      <div className="text-gray-500">{formatDate(user.created_at)}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => fetchUserDetails(user.id)}
                      className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить критерии поиска</p>
          </div>
        )}
      </div>

      {/* Модал деталей пользователя */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Профиль клиента: {getUserDisplayName(selectedUser)}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Основная информация</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Имя:</span>
                      <span className="text-sm font-medium">{getUserDisplayName(selectedUser)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Telegram ID:</span>
                      <span className="text-sm font-mono">{selectedUser.telegram_id}</span>
                    </div>
                    {selectedUser.username && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Username:</span>
                        <span className="text-sm">@{selectedUser.username}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Телефон:</span>
                      <span className="text-sm">{selectedUser.phone || 'Не указан'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Язык:</span>
                      <span className="text-sm">{selectedUser.language_code.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Регистрация:</span>
                      <span className="text-sm">{formatDate(selectedUser.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Статистика заказов</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedUser.stats?.totalBookings || 0}
                      </div>
                      <div className="text-sm text-blue-600">Всего заказов</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedUser.stats?.completedBookings || 0}
                      </div>
                      <div className="text-sm text-green-600">Завершено</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {formatCurrency(selectedUser.stats?.totalSpent || 0)}
                      </div>
                      <div className="text-sm text-purple-600">Общая сумма</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedUser.stats?.avgRating?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-yellow-600">Рейтинг</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* История заказов */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">История заказов</h4>
                {selectedUser.bookings && selectedUser.bookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.from_location} → {booking.to_location}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatDate(booking.created_at)}
                              {booking.pickup_time && (
                                <span> • Подача: {formatDate(booking.pickup_time)}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(booking.price)} сум
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </div>
                        </div>

                        {booking.vehicle && (
                          <div className="text-sm text-gray-600 mb-1">
                            🚗 {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.type})
                          </div>
                        )}

                        {booking.driver && (
                          <div className="text-sm text-gray-600">
                            👤 {booking.driver.name} • 📞 {booking.driver.phone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">У клиента пока нет заказов</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
