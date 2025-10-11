import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapPin, Calendar, Car, Navigation } from 'lucide-react'
import api from '@/services/api'
import VehicleTracker from '@/components/VehicleTracker'
import FarukBadge from '@/assets/faruk-badge.svg'

interface Booking {
  id: string
  bookingNumber: string
  fromLocation: string
  toLocation: string
  status: string
  price: number
  vehicle?: {
    id: number
    name: string
    brand?: string
    model?: string
    licensePlate?: string
    wialonUnitId?: string | null
  }
  driver?: {
    name: string
    phone: string
  }
  createdAt: string
}

export function BookingStatus() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  // Функция для перевода статусов
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Ожидание',
      'VEHICLE_ASSIGNED': 'Автомобиль назначен',
      'CONFIRMED': 'Подтверждён',
      'IN_PROGRESS': 'В пути',
      'COMPLETED': 'Завершён',
      'CANCELLED': 'Отменён'
    }
    return statusMap[status] || status
  }

  useEffect(() => {
    if (bookingId) {
      loadBooking()
    }
  }, [bookingId])

  const loadBooking = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/bookings/${bookingId}`)
      if (response.data.success) {
        console.log('📦 Booking data:', response.data.data)
        console.log('🚗 Vehicle data:', response.data.data.vehicle)
        console.log('🔗 Wialon Unit ID:', response.data.data.vehicle?.wialonUnitId)
        setBooking(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load booking:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Статус заказа
        </h1>

        {booking ? (
          <div className="space-y-6">
            {/* Отслеживание автомобиля */}
            {booking.vehicle?.wialonUnitId && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={24} className="text-green-600" />
                  Отслеживание автомобиля
                </h2>
                <VehicleTracker
                  wialonUnitId={booking.vehicle.wialonUnitId}
                  vehicleName={booking.vehicle.name}
                  autoRefresh={true}
                  refreshInterval={30}
                />
              </div>
            )}

            {/* Основная информация */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 font-mono">
                  {booking.bookingNumber}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'CONFIRMED' || booking.status === 'VEHICLE_ASSIGNED' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(booking.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Navigation className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Маршрут</p>
                    <p className="font-medium text-gray-900">
                      {booking.fromLocation} → {booking.toLocation}
                    </p>
                  </div>
                </div>

                {booking.vehicle && (
                  <div className="flex items-start gap-3">
                    <Car className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Автомобиль</p>
                      <p className="font-medium text-gray-900">
                        {booking.vehicle.name}
                        {booking.vehicle.licensePlate && ` (${booking.vehicle.licensePlate})`}
                      </p>
                    </div>
                  </div>
                )}

                {booking.driver && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gray-400 rounded-full mt-1 flex items-center justify-center text-white text-xs">
                      👤
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Водитель</p>
                      <p className="font-medium text-gray-900">{booking.driver.name}</p>
                      <p className="text-sm text-gray-600">{booking.driver.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Дата создания</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка назад */}
            <div className="mt-6">
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary w-full"
              >
                ← Назад
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-center">
              Заказ не найден
            </p>
            <button
              onClick={() => navigate('/language')}
              className="btn-secondary w-full mt-4"
            >
              На главную
            </button>
          </div>
        )}
        
        {/* Footer */}
        <motion.div
          className="text-center mt-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-2">Developed by</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
