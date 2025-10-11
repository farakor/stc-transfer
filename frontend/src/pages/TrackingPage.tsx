import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import VehicleTracker from '../components/VehicleTracker';
import api from '../services/api';

interface Booking {
  id: string;
  bookingNumber: string;
  from_location: string;
  to_location: string;
  status: string;
  vehicle?: {
    id: number;
    name: string;
    brand?: string;
    model?: string;
    license_plate?: string;
    wialonUnitId?: string | null;
  };
}

const TrackingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/bookings/${bookingId}`);
      
      if (response.data.success) {
        setBooking(response.data.data);
      } else {
        setError('Не удалось загрузить данные заказа');
      }
    } catch (err) {
      console.error('Failed to load booking:', err);
      setError('Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={32} />
              <h2 className="text-xl font-semibold text-gray-900">Ошибка</h2>
            </div>
            <p className="text-gray-700 mb-6">
              {error || 'Заказ не найден'}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Вернуться назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking.vehicle?.wialonUnitId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 max-w-4xl">
          {/* Заголовок */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Назад
          </button>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <AlertCircle className="text-yellow-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Отслеживание недоступно
              </h2>
              <p className="text-gray-600 mb-6">
                Для этого заказа отслеживание в реальном времени пока недоступно.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Информация о заказе</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Номер:</span> <span className="font-mono">{booking.bookingNumber}</span></p>
                  <p><span className="font-medium">Маршрут:</span> {booking.from_location} → {booking.to_location}</p>
                  <p><span className="font-medium">Статус:</span> {booking.status}</p>
                  {booking.vehicle && (
                    <p><span className="font-medium">Автомобиль:</span> {booking.vehicle.name}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Вернуться к заказу
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Заголовок */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Назад
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Отслеживание заказа
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Номер заказа:</span> <span className="font-mono">{booking.bookingNumber}</span>
              </div>
              <div className="hidden sm:block">•</div>
              <div>
                <span className="font-medium">Маршрут:</span> {booking.from_location} → {booking.to_location}
              </div>
              {booking.vehicle && (
                <>
                  <div className="hidden sm:block">•</div>
                  <div>
                    <span className="font-medium">Автомобиль:</span>{' '}
                    {booking.vehicle.name}
                    {booking.vehicle.license_plate && ` (${booking.vehicle.license_plate})`}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Карта отслеживания */}
        <VehicleTracker
          wialonUnitId={booking.vehicle.wialonUnitId}
          vehicleName={booking.vehicle.name}
          autoRefresh={true}
          refreshInterval={15}
        />

        {/* Дополнительная информация */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">О заказе</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Статус заказа</p>
              <p className="font-medium text-gray-900">{booking.status}</p>
            </div>
            {booking.vehicle && (
              <>
                <div>
                  <p className="text-gray-600">Автомобиль</p>
                  <p className="font-medium text-gray-900">
                    {booking.vehicle.brand} {booking.vehicle.model || booking.vehicle.name}
                  </p>
                </div>
                {booking.vehicle.license_plate && (
                  <div>
                    <p className="text-gray-600">Гос. номер</p>
                    <p className="font-medium text-gray-900">{booking.vehicle.license_plate}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;

