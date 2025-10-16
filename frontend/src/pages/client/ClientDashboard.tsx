import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuth } from '@/hooks/useAuth'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { BookingService } from '@/services/bookingService'
import { Booking } from '@/types'
import { PlusCircle, ClipboardList, Calendar, Loader2 } from 'lucide-react'

export function ClientDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { user: telegramUser } = useTelegramWebApp()
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (telegramUser?.id) {
      loadRecentBookings()
    }
  }, [telegramUser?.id])

  const loadRecentBookings = async () => {
    if (!telegramUser?.id) return
    
    try {
      setLoading(true)
      const bookings = await BookingService.getUserBookings(telegramUser.id, 3)
      setRecentBookings(bookings)
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

  const quickAction = {
    id: 'new-booking',
    title: t.actions.newBooking,
    description: t.actions.newBookingDesc,
    icon: PlusCircle,
    path: '/vehicles'
  }

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            {t.dashboard.welcome}!
          </h2>
          <p className="text-blue-700">
            {user?.phone_number || t.dashboard.welcomeDesc}
          </p>
        </div>

        {/* Quick Action */}
        <div>
          <button
            onClick={() => navigate(quickAction.path)}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {quickAction.title}
                </h3>
                <p className="text-blue-100">
                  {quickAction.description}
                </p>
              </div>
              <div className="text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                →
              </div>
            </div>
          </button>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t.dashboard.recentBookings}
            </h3>
            <button
              onClick={() => navigate('/client/history')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              {t.dashboard.viewAll} →
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600 mt-2">{t.common.loading}</p>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {t.dashboard.noBookings}
              </p>
              <button
                onClick={() => navigate('/vehicles')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.dashboard.createFirst}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => navigate(`/status/${booking.id}`)}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {t.bookingDetails.number} #{booking.bookingNumber}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.fromLocation} → {booking.toLocation}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(booking.createdAt).toLocaleDateString('ru-RU')}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {booking.price.toLocaleString()} сум
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

    </div>
  )
}

