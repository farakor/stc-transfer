import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Car, 
  MapPin, 
  Clock, 
  Phone, 
  Users, 
  CheckCircle, 
  Play, 
  Square, 
  LogOut,
  RefreshCw,
  AlertCircle,
  Navigation,
  Bell,
  BellRing
} from 'lucide-react';
import { useDriverNotifications } from '@/hooks/useDriverNotifications';

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
  };
  notes?: string;
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
  const navigate = useNavigate();

  // Хук для уведомлений
  const {
    hasNewBookings,
    newBookingsCount,
    clearNotifications,
    requestNotificationPermission
  } = useDriverNotifications(driver?.id || null, bookings);

  useEffect(() => {
    const savedDriver = localStorage.getItem('driver');
    if (!savedDriver) {
      navigate('/driver/login');
      return;
    }

    const driverData = JSON.parse(savedDriver);
    setDriver(driverData);
    setBookings(driverData.activeBookings || []);
    setLoading(false);
    
    // Запрашиваем разрешение на уведомления
    requestNotificationPermission();
    
    // Запускаем периодическое обновление
    const interval = setInterval(fetchActiveBookings, 30000); // каждые 30 секунд
    
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchActiveBookings = async () => {
    if (!driver) return;

    try {
      const response = await fetch(`/api/drivers/${driver.id}/active-bookings`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

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
    localStorage.removeItem('driver');
    navigate('/driver/login');
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

  const getActionButton = (booking: Booking) => {
    const isLoading = actionLoading === booking.id;

    switch (booking.status) {
      case 'VEHICLE_ASSIGNED':
        return (
          <button
            onClick={() => handleBookingAction(booking.id, 'accept')}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>Принять заказ</span>
          </button>
        );
      
      case 'CONFIRMED':
        return (
          <button
            onClick={() => handleBookingAction(booking.id, 'start')}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Начать рейс</span>
          </button>
        );
      
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleBookingAction(booking.id, 'complete')}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Завершить заказ</span>
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
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{driver.name}</h1>
                <p className="text-sm text-gray-500">Водитель</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Индикатор новых заказов */}
              {hasNewBookings && (
                <div className="relative">
                  <button
                    onClick={clearNotifications}
                    className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <BellRing className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {newBookingsCount} новых заказов
                    </span>
                  </button>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Driver Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о водителе</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Телефон</p>
                <p className="font-medium">{driver.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Лицензия</p>
                <p className="font-medium">{driver.license}</p>
              </div>
            </div>
            {driver.vehicle && (
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Автомобиль</p>
                  <p className="font-medium">
                    {driver.vehicle.brand} {driver.vehicle.model}
                  </p>
                  <p className="text-sm text-gray-500">{driver.vehicle.licensePlate}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Active Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Активные заказы</h2>
            <button
              onClick={fetchActiveBookings}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Обновить</span>
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных заказов</h3>
              <p className="text-gray-500">Ожидайте назначения новых заказов от диспетчера</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                          {statusLabels[booking.status as keyof typeof statusLabels]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTime(booking.createdAt)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Откуда:</span>
                          </div>
                          <p className="text-gray-900 ml-6">{booking.fromLocation}</p>
                          {booking.pickupLocation && (
                            <p className="text-sm text-gray-500 ml-6">{booking.pickupLocation}</p>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium">Куда:</span>
                          </div>
                          <p className="text-gray-900 ml-6">{booking.toLocation}</p>
                          {booking.dropoffLocation && (
                            <p className="text-sm text-gray-500 ml-6">{booking.dropoffLocation}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Пассажиров: {booking.passengerCount}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-green-600">
                            {formatPrice(booking.price)}
                          </span>
                        </div>

                        {booking.pickupTime && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatTime(booking.pickupTime)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Клиент:</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{booking.user.name}</span>
                          <a 
                            href={`tel:${booking.user.phone}`}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{booking.user.phone}</span>
                          </a>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">Примечания:</h4>
                          <p className="text-sm text-yellow-700">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {getActionButton(booking)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
