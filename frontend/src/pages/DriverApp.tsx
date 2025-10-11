import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle,
  AlertCircle,
  Car,
  User,
  DollarSign,
  RefreshCw,
  Settings,
  LogOut
} from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface Driver {
  id: number;
  name: string;
  phone: string;
  license: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  vehicle?: {
    id: number;
    brand: string;
    model: string;
    license_plate: string;
    type: string;
  };
}

interface Trip {
  id: string;
  from_location: string;
  to_location: string;
  pickup_location?: string;
  dropoff_location?: string;
  pickup_time?: string;
  passenger_count: number;
  price: number;
  status: 'VEHICLE_ASSIGNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';
  user: {
    name?: string;
    phone?: string;
    telegram_id: string;
  };
  notes?: string;
  distance_km?: number;
  created_at: string;
}

const DriverApp: React.FC = () => {
  const { webApp, isReady, user, isInTelegram } = useTelegramWebApp();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tripInProgress, setTripInProgress] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    // Настройка Telegram Web App
    if (webApp && isReady) {
      try {
        webApp.ready();
        webApp.expand();
      } catch (error) {
        console.log('⚠️ Telegram WebApp methods not available:', error);
      }

      // Получаем данные пользователя из Telegram
      if (user) {
        authenticateDriver(user.id.toString());
      } else {
        // Fallback для тестирования без Telegram
        authenticateDriver('12345');
      }
    } else if (!isInTelegram) {
      // Для разработки вне Telegram
      authenticateDriver('12345');
    }

    // Запрашиваем геолокацию
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
        }
      );
    }
  }, [webApp, isReady, user, isInTelegram]);

  const authenticateDriver = async (telegramId: string) => {
    try {
      setLoading(true);
      console.log('🚗 Аутентификация водителя:', telegramId);

      // Ищем водителя по Telegram ID (пока заглушка)
      const response = await fetch(`/api/drivers/telegram/${telegramId}`);

      if (response.ok) {
        const data = await response.json();
        setDriver(data.data);
        loadDriverTrips(data.data.id);
      } else {
        // Заглушка для демонстрации
        const mockDriver: Driver = {
          id: 12,
          name: 'Ибрагим Азизов',
          phone: '+998 90 123 45 67',
          license: 'AB1234567',
          status: 'AVAILABLE',
          vehicle: {
            id: 34,
            brand: 'Hongqi',
            model: 'EHS5',
            license_plate: '01 A 123 BC',
            type: 'SEDAN'
          }
        };
        setDriver(mockDriver);
        loadDriverTrips(mockDriver.id);
      }
    } catch (error) {
      console.error('❌ Ошибка аутентификации водителя:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDriverTrips = async (driverId: number) => {
    try {
      console.log('📋 Загружаем рейсы водителя:', driverId);

      const response = await fetch(`/api/drivers/${driverId}/trips`);

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          const trips = data.data;

          // Находим активный рейс
          const activeTrip = trips.find((trip: Trip) => trip.status === 'IN_PROGRESS');
          if (activeTrip) {
            setCurrentTrip(activeTrip);
            setTripInProgress(true);
          }

          // Находим ожидающие рейсы
          const pending = trips.filter((trip: Trip) => 
            trip.status === 'VEHICLE_ASSIGNED' || trip.status === 'CONFIRMED'
          );
          setPendingTrips(pending);
        }
      } else {
        // Заглушка для демонстрации
        const mockTrips: Trip[] = [
          {
            id: 'cme7a1y190001kp74vpdgtdhq',
            from_location: 'Hilton Garden Inn Samarkand Afrosiyob',
            to_location: 'Savitsky Plaza',
            pickup_time: '2025-08-11T16:00:00Z',
            passenger_count: 2,
            price: 20000,
            status: 'CONFIRMED',
            user: {
              name: 'Тестовый пользователь',
              phone: '+998901234567',
              telegram_id: '12345'
            },
            notes: 'Встретить у главного входа',
            distance_km: 5.2,
            created_at: '2025-08-11T15:38:32.971Z'
          }
        ];
        setPendingTrips(mockTrips);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки рейсов:', error);
    }
  };

  const acceptTrip = async (tripId: string) => {
    try {
      console.log('✅ Принимаем заказ:', tripId);

      const response = await fetch(`/api/drivers/${driver?.id}/bookings/${tripId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const trip = pendingTrips.find(t => t.id === tripId);
        if (trip) {
          const updatedTrip = { ...trip, status: 'CONFIRMED' as const };
          setPendingTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));

          if (webApp?.showAlert) {
            webApp.showAlert('Заказ принят! Теперь можете начать рейс.');
          } else {
            alert('Заказ принят! Теперь можете начать рейс.');
          }
        }
      } else {
        if (webApp?.showAlert) {
          webApp.showAlert('Ошибка при принятии заказа');
        } else {
          alert('Ошибка при принятии заказа');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка принятия заказа:', error);
      if (webApp?.showAlert) {
        webApp.showAlert('Ошибка при принятии заказа');
      } else {
        alert('Ошибка при принятии заказа');
      }
    }
  };

  const startTrip = async (tripId: string) => {
    try {
      console.log('🚀 Начинаем рейс:', tripId);

      const response = await fetch(`/api/bookings/${tripId}/start`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver?.id,
          location: driverLocation
        })
      });

      if (response.ok) {
        const trip = pendingTrips.find(t => t.id === tripId);
        if (trip) {
          const updatedTrip = { ...trip, status: 'IN_PROGRESS' as const };
          setCurrentTrip(updatedTrip);
          setTripInProgress(true);
          setPendingTrips(prev => prev.filter(t => t.id !== tripId));

          // Обновляем статус водителя
          if (driver) {
            setDriver({ ...driver, status: 'BUSY' });
          }

          if (webApp?.showAlert) {
            webApp.showAlert('Рейс начат! Удачной поездки!');
          } else {
            alert('Рейс начат! Удачной поездки!');
          }
        }
      } else {
        if (webApp?.showAlert) {
          webApp.showAlert('Ошибка при начале рейса');
        } else {
          alert('Ошибка при начале рейса');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка начала рейса:', error);
      if (webApp?.showAlert) {
        webApp.showAlert('Ошибка при начале рейса');
      } else {
        alert('Ошибка при начале рейса');
      }
    }
  };

  const completeTrip = async () => {
    if (!currentTrip) return;

    try {
      console.log('✅ Завершаем рейс:', currentTrip.id);

      const response = await fetch(`/api/bookings/${currentTrip.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver?.id,
          location: driverLocation
        })
      });

      if (response.ok) {
        setCurrentTrip(null);
        setTripInProgress(false);

        // Обновляем статус водителя
        if (driver) {
          setDriver({ ...driver, status: 'AVAILABLE' });
        }

        // Перезагружаем рейсы
        if (driver) {
          loadDriverTrips(driver.id);
        }

        if (webApp?.showAlert) {
          webApp.showAlert('Рейс успешно завершен!');
        } else {
          alert('Рейс успешно завершен!');
        }
      } else {
        if (webApp?.showAlert) {
          webApp.showAlert('Ошибка при завершении рейса');
        } else {
          alert('Ошибка при завершении рейса');
        }
      }
    } catch (error) {
      console.error('❌ Ошибка завершения рейса:', error);
      if (webApp?.showAlert) {
        webApp.showAlert('Ошибка при завершении рейса');
      } else {
        alert('Ошибка при завершении рейса');
      }
    }
  };

  const callClient = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const openNavigation = (destination: string) => {
    if (driverLocation) {
      const url = `https://yandex.ru/maps/?rtext=${driverLocation.lat},${driverLocation.lng}~${encodeURIComponent(destination)}&rtt=mt`;
      window.open(url, '_blank');
    } else {
      const url = `https://yandex.ru/maps/?text=${encodeURIComponent(destination)}`;
      window.open(url, '_blank');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Свободен';
      case 'BUSY': return 'В рейсе';
      case 'OFFLINE': return 'Не в сети';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Загрузка приложения водителя...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">
            Ваш аккаунт не найден в системе водителей.
            Обратитесь к администратору для получения доступа.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="font-semibold text-gray-900">{driver.name}</h1>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(driver.status)}`}>
                    {getStatusText(driver.status)}
                  </span>
                  {driver.vehicle && (
                    <span className="text-xs text-gray-500">
                      {driver.vehicle.brand} {driver.vehicle.model}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Активный рейс */}
        {currentTrip && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <Play className="w-4 h-4 mr-2 text-green-600" />
                Активный рейс
              </h2>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(currentTrip.price)} сум
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{currentTrip.from_location}</div>
                  <div className="text-sm text-gray-600">↓</div>
                  <div className="font-medium text-gray-900">{currentTrip.to_location}</div>
                </div>
                <button
                  onClick={() => openNavigation(currentTrip.to_location)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                >
                  <Navigation className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{currentTrip.passenger_count} чел.</span>
                  </div>
                  {currentTrip.pickup_time && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatTime(currentTrip.pickup_time)}</span>
                    </div>
                  )}
                  {currentTrip.distance_km && (
                    <div className="text-gray-600">
                      {currentTrip.distance_km} км
                    </div>
                  )}
                </div>
              </div>

              {currentTrip.user.phone && (
                <button
                  onClick={() => callClient(currentTrip.user.phone)}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-green-100 text-green-700 rounded-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span>Позвонить клиенту</span>
                </button>
              )}

              {currentTrip.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-yellow-800 mb-1">Заметки:</div>
                  <div className="text-sm text-yellow-700">{currentTrip.notes}</div>
                </div>
              )}

              <button
                onClick={completeTrip}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Завершить рейс</span>
              </button>
            </div>
          </div>
        )}

        {/* Ожидающие рейсы */}
        {pendingTrips.length > 0 && !currentTrip && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Новые рейсы</h2>
            {pendingTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {trip.pickup_time ? formatTime(trip.pickup_time) : 'Сейчас'}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(trip.price)} сум
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{trip.from_location}</div>
                      <div className="text-sm text-gray-600">↓</div>
                      <div className="font-medium text-gray-900">{trip.to_location}</div>
                    </div>
                    <button
                      onClick={() => openNavigation(trip.from_location)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{trip.passenger_count} чел.</span>
                      </div>
                      {trip.distance_km && (
                        <span>{trip.distance_km} км</span>
                      )}
                    </div>
                    {trip.user.phone && (
                      <button
                        onClick={() => callClient(trip.user.phone)}
                        className="flex items-center space-x-1 text-green-600"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Позвонить</span>
                      </button>
                    )}
                  </div>

                  {trip.notes && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">Заметки:</div>
                      <div className="text-xs text-gray-600">{trip.notes}</div>
                    </div>
                  )}
                </div>

                {trip.status === 'VEHICLE_ASSIGNED' ? (
                  <button
                    onClick={() => acceptTrip(trip.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Принять заказ</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startTrip(trip.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span className="font-medium">Начать рейс</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Статус "нет рейсов" */}
        {pendingTrips.length === 0 && !currentTrip && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных рейсов</h3>
            <p className="text-gray-600 mb-4">
              Когда появятся новые заказы, они будут отображены здесь
            </p>
            <button
              onClick={() => driver && loadDriverTrips(driver.id)}
              className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Обновить</span>
            </button>
          </div>
        )}

        {/* Информация о водителе */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Информация о водителе</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Телефон:</span>
              <span className="font-medium">{driver.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Права:</span>
              <span className="font-medium">{driver.license}</span>
            </div>
            {driver.vehicle && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Автомобиль:</span>
                  <span className="font-medium">
                    {driver.vehicle.brand} {driver.vehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Госномер:</span>
                  <span className="font-medium">{driver.vehicle.license_plate}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverApp;
