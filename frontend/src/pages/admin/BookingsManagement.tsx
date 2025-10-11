import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  UserCheck,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Car,
  Calendar,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { Booking, BookingStatus, Vehicle } from '../../types';
import { adminService } from '../../services/adminService';
import { BookingService } from '../../services/bookingService';
import { VehicleService } from '../../services/vehicleService';
import LicensePlate from '../../components/LicensePlate';

interface BookingWithDetails extends Booking {
  user: {
    name?: string;
    phone?: string;
    telegram_id: string;
  };
  vehicle?: {
    brand: string;
    model: string;
    licensePlate: string;
  };
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
}

const BookingsManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [assignVehicleModal, setAssignVehicleModal] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchVehicles();

    // Автообновление каждые 30 секунд
    const interval = setInterval(() => {
      fetchBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      console.log('📋 Начинаем загрузку всех заказов...');
      setLoading(true);
      const response = await adminService.getAllBookingsForAdmin();
      console.log('📦 Получен ответ от API:', response);
      console.log('📊 Данные заказов:', response.data);
      setBookings(response.data || []);
      console.log(`✅ Загружено ${response.data?.length || 0} заказов`);
    } catch (error) {
      console.error('❌ Ошибка при получении заказов:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchVehicles = async () => {
    try {
      const vehiclesList = await VehicleService.getAvailableVehicles();
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Ошибка при получении автомобилей:', error);
      // Используем заглушку для автомобилей
      const mockVehicles = [
        {
          id: '1',
          brand: 'Kia',
          model: 'Carnival',
          type: 'MINIVAN',
          capacity: 8,
          baggageCapacity: 4,
          licensePlate: '01 A 123 BC',
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          driver: {
            id: '1',
            name: 'Ибрагим Азизов',
            phone: '+998 90 123 45 67',
            vehicleId: '1',
            status: 'AVAILABLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            vehicle: {} as Vehicle
          },
          pricing: []
        },
        {
          id: '2',
          brand: 'Mercedes',
          model: 'Sprinter',
          type: 'MICROBUS',
          capacity: 16,
          baggageCapacity: 8,
          licensePlate: '01 B 456 CD',
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          driver: {
            id: '2',
            name: 'Азиз Рахимов',
            phone: '+998 91 234 56 78',
            vehicleId: '2',
            status: 'AVAILABLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            vehicle: {} as Vehicle
          },
          pricing: []
        }
      ];
      setVehicles(mockVehicles as Vehicle[]);
    }
  };

  const handleAssignVehicle = async (bookingId: string, vehicleId: string) => {
    try {
      await BookingService.assignVehicle(bookingId, vehicleId);
      fetchBookings();
      setAssignVehicleModal(null);
      alert('Автомобиль успешно назначен! Клиент получил уведомление.');
    } catch (error) {
      console.error('Ошибка при назначении автомобиля:', error);
      alert('Ошибка при назначении автомобиля');
    }
  };


  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Вы уверены, что хотите отменить этот заказ?')) {
      return;
    }

    try {
      // Используем BookingService для обновления статуса
      await BookingService.updateBookingStatus(bookingId, 'cancelled', 'Отменено диспетчером');
      
      fetchBookings();
      alert('Заказ отменен! Клиент получил уведомление.');
    } catch (error) {
      console.error('Ошибка при отмене заказа:', error);
      alert('Ошибка при отмене заказа');
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'VEHICLE_ASSIGNED': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING': return 'Ожидает';
      case 'VEHICLE_ASSIGNED': return 'Машина назначена';
      case 'CONFIRMED': return 'Подтвержден';
      case 'IN_PROGRESS': return 'В пути';
      case 'COMPLETED': return 'Завершен';
      case 'CANCELLED': return 'Отменен';
      default: return status;
    }
  };

  const getVehicleTypeName = (vehicleType: string) => {
    switch (vehicleType) {
      case 'SEDAN': return 'Седан';
      case 'PREMIUM': return 'Премиум';
      case 'MINIVAN': return 'Минивэн';
      case 'MICROBUS': return 'Микроавтобус';
      case 'BUS': return 'Автобус';
      default: return vehicleType;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'ALL' || booking.status === filter;
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.phone?.includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Управление заказами</h1>
          <p className="text-gray-600 mt-1">Просмотр и управление всеми заказами</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по ID, маршруту, клиенту..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Фильтр по статусу */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as BookingStatus | 'ALL')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Все статусы</option>
              <option value="PENDING">Ожидают</option>
              <option value="VEHICLE_ASSIGNED">Машина назначена</option>
              <option value="CONFIRMED">Подтверждены</option>
              <option value="IN_PROGRESS">В пути</option>
              <option value="COMPLETED">Завершены</option>
              <option value="CANCELLED">Отменены</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список заказов */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">ID заказа</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Клиент</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Маршрут</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Транспорт</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Статус</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Стоимость</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Дата</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm text-blue-600">
                      {booking.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.user.name || 'Не указано'}
                        </div>
                        {booking.user.phone && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {booking.user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.fromLocation}
                        </div>
                        <div className="text-sm text-gray-600">
                          → {booking.toLocation}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {booking.vehicle ? (
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.vehicle.brand} {booking.vehicle.model}
                          </div>
                          <div className="my-1">
                            <LicensePlate
                              plateNumber={booking.vehicle.licensePlate}
                              size="small"
                            />
                          </div>
                          {booking.driver && (
                            <div className="text-xs text-gray-500">
                              Водитель: {booking.driver.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="text-sm text-orange-600">
                            Требуется: {getVehicleTypeName(booking.vehicleType || 'SEDAN')}
                          </div>
                          <div className="text-xs text-gray-500">
                            Ожидает назначения
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {Number(booking.price).toLocaleString()} сум
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Просмотр"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => setAssignVehicleModal(booking.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Назначить автомобиль"
                        >
                          <Car className="w-4 h-4" />
                        </button>
                      )}

                      {['PENDING', 'VEHICLE_ASSIGNED', 'CONFIRMED'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Отменить заказ"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Заказы не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        )}
      </div>

      {/* Модал назначения автомобиля */}
      {assignVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Назначить автомобиль</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(() => {
                const selectedBooking = bookings.find(b => b.id === assignVehicleModal);
                const requiredType = selectedBooking?.vehicleType;
                const availableVehicles = vehicles.filter(v =>
                  v.status === 'AVAILABLE' &&
                  v.driver?.status === 'AVAILABLE' &&
                  (!requiredType || v.type === requiredType)
                );

                return availableVehicles.length > 0 ? (
                  availableVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleAssignVehicle(assignVehicleModal, vehicle.id)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          <div className="my-1">
                            <LicensePlate
                              plateNumber={vehicle.licensePlate}
                              size="small"
                            />
                          </div>
                          {vehicle.driver && (
                            <div className="text-xs text-gray-500">
                              Водитель: {vehicle.driver.name}
                            </div>
                          )}
                          <div className="text-xs text-blue-500">
                            Вместимость: {vehicle.capacity} чел.
                          </div>
                        </div>
                        <Car className="w-5 h-5 text-blue-500" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Нет доступных автомобилей</p>
                    <p className="text-sm">
                      {(() => {
                        const selectedBooking = bookings.find(b => b.id === assignVehicleModal);
                        const requiredType = selectedBooking?.vehicleType;
                        return requiredType
                          ? `Нет доступных автомобилей типа "${getVehicleTypeName(requiredType)}"`
                          : 'Все автомобили заняты или находятся на обслуживании';
                      })()}
                    </p>
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setAssignVehicleModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Модал просмотра заказа */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Детали заказа</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID заказа</label>
                  <p className="font-mono text-sm text-blue-600">{selectedBooking.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusText(selectedBooking.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Маршрут</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedBooking.fromLocation} → {selectedBooking.toLocation}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Клиент</label>
                  <div className="space-y-1">
                    <p>{selectedBooking.user.name || 'Не указано'}</p>
                    {selectedBooking.user.phone && (
                      <p className="text-sm text-gray-600">{selectedBooking.user.phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость</label>
                  <p className="text-lg font-medium">{Number(selectedBooking.price).toLocaleString()} сум</p>
                </div>
              </div>

              {selectedBooking.vehicle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Транспорт</label>
                  <div className="space-y-2">
                    <p className="font-medium">{selectedBooking.vehicle.brand} {selectedBooking.vehicle.model}</p>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Госномер:</p>
                      <LicensePlate
                        plateNumber={selectedBooking.vehicle.licensePlate}
                        size="medium"
                      />
                    </div>
                    {selectedBooking.driver && (
                      <div className="text-sm text-gray-600">
                        <p>Водитель: {selectedBooking.driver.name}</p>
                        <p>Телефон: {selectedBooking.driver.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Комментарии</label>
                  <p className="text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата создания</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedBooking.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                {selectedBooking.pickupTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Время подачи</label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedBooking.pickupTime).toLocaleString('ru-RU')}
                    </p>
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

export default BookingsManagement;
