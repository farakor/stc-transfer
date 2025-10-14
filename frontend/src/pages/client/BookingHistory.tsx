import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClientLayout } from './ClientLayout'
import { useTranslation } from '@/hooks/useTranslation'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { BookingService } from '@/services/bookingService'
import { Booking } from '@/types'
import { Car, Bus, ClipboardList, Calendar, Clock, Ruler, Loader2 } from 'lucide-react'

export function BookingHistory() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user: telegramUser } = useTelegramWebApp()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (telegramUser?.id) {
      loadBookings()
    }
  }, [telegramUser?.id])

  const loadBookings = async () => {
    if (!telegramUser?.id) return
    
    try {
      setLoading(true)
      const data = await BookingService.getUserBookings(telegramUser.id)
      setBookings(data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return t.status.confirmed
      case 'pending':
        return t.status.pending
      case 'cancelled':
        return t.status.cancelled
      case 'completed':
        return t.status.completed
      case 'in_progress':
        return t.status.inProgress
      default:
        return status
    }
  }

  const getVehicleIcon = (vehicleType?: string) => {
    if (!vehicleType) return Car
    switch (vehicleType.toLowerCase()) {
      case 'sedan':
      case 'premium':
        return Car
      case 'minivan':
      case 'microbus':
        return Bus
      case 'bus':
        return Bus
      default:
        return Car
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'active') {
      return ['pending', 'confirmed', 'in_progress'].includes(booking.status.toLowerCase())
    }
    if (filter === 'completed') {
      return booking.status.toLowerCase() === 'completed'
    }
    if (filter === 'cancelled') {
      return booking.status.toLowerCase() === 'cancelled'
    }
    return true
  })

  const filters = [
    { id: 'all' as const, label: t.filter.all, count: bookings.length },
    {
      id: 'active' as const,
      label: t.filter.active,
      count: bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status.toLowerCase())).length
    },
    {
      id: 'completed' as const,
      label: t.filter.completed,
      count: bookings.filter(b => b.status.toLowerCase() === 'completed').length
    },
    {
      id: 'cancelled' as const,
      label: t.filter.cancelled,
      count: bookings.filter(b => b.status.toLowerCase() === 'cancelled').length
    }
  ]

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t.history.title}
          </h1>
          <p className="text-gray-600">
            {t.history.subtitle}
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors
                ${filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }
              `}
            >
              {f.label} {f.count > 0 && `(${f.count})`}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 mt-2">{t.common.loading}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.history.noBookings}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? t.history.noBookingsAll
                : t.history.noBookingsFilter
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/vehicles')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.history.createBooking}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const VehicleIcon = getVehicleIcon(booking.vehicleType)
              return (
                <div
                  key={booking.id}
                  onClick={() => navigate(`/status/${booking.id}`)}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <VehicleIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {t.bookingDetails.number} #{booking.bookingNumber}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {booking.fromLocation} → {booking.toLocation}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(booking.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {booking.pickupTime && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(booking.pickupTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {booking.distanceKm && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Ruler className="w-4 h-4" />
                        <span>{booking.distanceKm} км</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 font-semibold text-gray-900">
                      <span>💰</span>
                      <span>{booking.price.toLocaleString()} сум</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {t.bookingDetails.created}: {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                    <span className="text-blue-600 text-sm font-medium">
                      {t.bookingDetails.viewDetails} →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ClientLayout>
  )
}

