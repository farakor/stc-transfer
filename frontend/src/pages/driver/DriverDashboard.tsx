import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Clock, 
  Phone, 
  LogOut,
  RefreshCw,
  AlertCircle,
  Navigation,
  BellRing,
  DollarSign
} from 'lucide-react';
import { useDriverNotifications } from '@/hooks/useDriverNotifications';
import { SlideToStart } from '@/components/SlideToStart';

interface Driver {
  id: number;
  name: string;
  phone: string;
  license: string;
  status: string;
  vehicle: {
    id: number;
    brand: string;
    model: string;
    licensePlate: string;
    type: string;
  } | null;
  activeBookings: Booking[];
}

interface Booking {
  id: string;
  bookingNumber?: string;
  fromLocation: string;
  toLocation: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  passengerCount: number;
  price: number;
  status: string;
  user: {
    name: string;
    phone: string;
    photoUrl?: string;
    username?: string;
    telegramId?: string;
  };
  notes?: string;
  distanceKm?: number;
  createdAt: string;
}

const statusColors = {
  VEHICLE_ASSIGNED: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  VEHICLE_ASSIGNED: 'Машина назначена',
  CONFIRMED: 'Подтвержден',
  IN_PROGRESS: 'В пути',
  COMPLETED: 'Завершен'
};

const DriverDashboard: React.FC = () => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const navigate = useNavigate();

  // Хук для уведомлений
  const {
    hasNewBookings,
    newBookingsCount,
    clearNotifications,
    requestNotificationPermission
  } = useDriverNotifications(driver?.id || null, bookings);

  // Инициализация водителя
  useEffect(() => {
    const savedDriver = localStorage.getItem('driver');
    const driverAuthToken = localStorage.getItem('driverAuthToken');
    
    // Проверяем наличие токена - если нет, перенаправляем на Telegram авторизацию
    if (!savedDriver || !driverAuthToken) {
      console.log('❌ Водитель не авторизован - перенаправление на авторизацию через Telegram');
      navigate('/driver/auth');
      return;
    }

    const driverData = JSON.parse(savedDriver);
    setDriver(driverData);
    setBookings(driverData.activeBookings || []);
    setLoading(false);
    
    // Запрашиваем разрешение на уведомления
    requestNotificationPermission();
  }, [navigate, requestNotificationPermission]);

  // Функция для получения актуальных данных водителя (включая информацию о машине)
  const fetchDriverData = async () => {
    if (!driver) return;

    try {
      const response = await fetch(`/api/drivers/${driver.id}`);
      const data = await response.json();

      if (data.success) {
        // Обновляем данные водителя в state
        setDriver(data.data);
        // Обновляем также в localStorage
        localStorage.setItem('driver', JSON.stringify(data.data));
        console.log('✅ Данные водителя обновлены:', data.data.vehicle);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных водителя:', err);
    }
  };

  // Функция для получения активных заказов
  const fetchActiveBookings = async (showIndicator = false) => {
    if (!driver) return;

    if (showIndicator) {
      setIsAutoRefreshing(true);
    }

    try {
      const response = await fetch(`/api/drivers/${driver.id}/active-bookings`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
        setLastUpdateTime(new Date());
      }
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsAutoRefreshing(false), 500);
      }
    }
  };

  // Автоматическое обновление каждые 10 секунд
  useEffect(() => {
    if (!driver) return;

    // Первое обновление сразу после загрузки
    fetchActiveBookings(false);
    fetchDriverData(); // Обновляем данные водителя

    // Запускаем периодическое обновление каждые 10 секунд
    const interval = setInterval(() => {
      fetchActiveBookings(true);
      fetchDriverData(); // Обновляем данные водителя вместе с заказами
    }, 10000);
    
    return () => clearInterval(interval);
  }, [driver?.id]); // Используем только id для зависимости, чтобы избежать лишних перезапусков

  const handleBookingAction = async (bookingId: string, action: string) => {
    if (!driver) return;

    setActionLoading(bookingId);
    setError('');

    try {
      const response = await fetch(`/api/drivers/${driver.id}/bookings/${bookingId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем список заказов
        await fetchActiveBookings();
        
        // Показываем уведомление об успехе
        alert(data.data.message);
      } else {
        setError(data.error || 'Ошибка выполнения действия');
      }
    } catch (err) {
      console.error('Error performing action:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    // Удаляем данные водителя и токен
    localStorage.removeItem('driver');
    localStorage.removeItem('driverAuthToken');
    
    // Перенаправляем на страницу авторизации через Telegram
    navigate('/driver/auth');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTelegramLink = (user: Booking['user']) => {
    if (user.username) {
      return `https://t.me/${user.username}`;
    } else if (user.telegramId) {
      return `tg://user?id=${user.telegramId}`;
    }
    return null;
  };

  const getActionButton = (booking: Booking) => {
    const isLoading = actionLoading === booking.id;

    switch (booking.status) {
      case 'VEHICLE_ASSIGNED':
        return (
          <button
            onClick={() => handleBookingAction(booking.id, 'accept')}
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Обработка...' : 'Принять заказ'}
          </button>
        );
      
      case 'CONFIRMED':
        return (
          <SlideToStart
            onComplete={() => handleBookingAction(booking.id, 'start')}
            disabled={isLoading}
            text={isLoading ? 'Обработка...' : 'Свайп для начала рейса'}
          />
        );
      
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleBookingAction(booking.id, 'complete')}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Обработка...' : 'Завершить поездку'}
          </button>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-900 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 safe-area-top">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">{driver.name}</h1>
                {driver.vehicle && (
                  <p className="text-xs text-gray-500">
                    {driver.vehicle.brand} {driver.vehicle.model} • {driver.vehicle.licensePlate}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Индикатор автообновления */}
              <div className="flex items-center space-x-1.5">
                <RefreshCw 
                  className={`w-4 h-4 text-gray-400 ${isAutoRefreshing ? 'animate-spin text-blue-600' : ''}`} 
                />
                {isAutoRefreshing && (
                  <span className="text-xs text-blue-600 font-medium">Обновление...</span>
                )}
                {!isAutoRefreshing && (
                  <span className="text-xs text-gray-400">авто</span>
                )}
              </div>
              
              {hasNewBookings && (
                <button
                  onClick={clearNotifications}
                  className="relative p-2"
                >
                  <BellRing className="w-5 h-5 text-red-600" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {newBookingsCount}
                  </span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Navigation className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Нет активных заказов</h3>
            <p className="text-sm text-gray-500">Ожидайте назначения новых заказов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-4">
                {/* Заголовок */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    {booking.status === 'IN_PROGRESS' ? 'Активная поездка' : 'Новый заказ'}
                  </h3>
                </div>

                {/* Информация о клиенте и действия */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {getTelegramLink(booking.user) ? (
                      <a 
                        href={getTelegramLink(booking.user)!} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        {booking.user.photoUrl ? (
                          <img 
                            src={booking.user.photoUrl} 
                            alt={booking.user.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </a>
                    ) : (
                      <>
                        {booking.user.photoUrl ? (
                          <img 
                            src={booking.user.photoUrl} 
                            alt={booking.user.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{booking.user.name}</p>
                      <p className="text-xs text-gray-500">Клиент</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a 
                      href={`tel:${booking.user.phone}`}
                      className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-white" />
                    </a>
                    {getTelegramLink(booking.user) ? (
                      <a 
                        href={getTelegramLink(booking.user)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                      </a>
                    ) : (
                      <div className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center opacity-50">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Детали в одну строку */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center space-x-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.distanceKm ? `${booking.distanceKm} км` : '—'}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>30 мин</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-sm font-semibold text-gray-900">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatPrice(booking.price)}</span>
                  </div>
                </div>

                {/* Маршрут */}
                <div className="relative mb-4">
                  {/* Пунктирная линия между точками */}
                  <div className="absolute left-[5px] top-[12px] bottom-[22px]" 
                       style={{
                         backgroundImage: 'repeating-linear-gradient(0deg, #3b82f6, #3b82f6 4px, transparent 4px, transparent 8px)',
                         width: '2px'
                       }}>
                  </div>
                  
                  {/* Pickup */}
                  <div className="flex items-start space-x-3 mb-6 relative">
                    <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1 z-10"></div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Откуда</p>
                      <p className="text-sm font-medium text-gray-900">{booking.fromLocation}</p>
                      {booking.pickupLocation && (
                        <p className="text-xs text-gray-500 mt-0.5">{booking.pickupLocation}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Destination */}
                  <div className="flex items-start space-x-3 relative">
                    <div className="w-3 h-3 rounded-full bg-gray-900 flex-shrink-0 mt-1 z-10"></div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Куда</p>
                      <p className="text-sm font-medium text-gray-900">{booking.toLocation}</p>
                      {booking.dropoffLocation && (
                        <p className="text-xs text-gray-500 mt-0.5">{booking.dropoffLocation}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Примечания */}
                {booking.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">{booking.notes}</p>
                  </div>
                )}

                {/* Номер заказа и статус */}
                {booking.bookingNumber && (
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                    <span>Заказ #{booking.bookingNumber}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                      {statusLabels[booking.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                )}

                {/* Кнопка действия */}
                <div className="pt-3 border-t border-gray-100">
                  {getActionButton(booking)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
