import { motion } from 'framer-motion'
import { Booking, VehicleType } from '@/types'
import {
  formatDateTime,
  getBookingStatusColor,
  getBookingStatusName,
  formatTripPrice
} from '@/utils/formatting'
import { VehicleIcon } from '@/components/VehicleIcon'

interface BookingCardProps {
  booking: Booking
  onClick?: () => void
  className?: string
}

export function BookingCard({ booking, onClick, className }: BookingCardProps) {
  const isClickable = !!onClick

  return (
    <motion.div
      className={`
        bg-white rounded-xl shadow-card border border-gray-100 p-4 
        ${isClickable ? 'cursor-pointer hover:shadow-card-hover' : ''}
        ${className || ''}
      `}
      onClick={onClick}
      whileHover={isClickable ? { scale: 1.02 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      layout
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <VehicleIcon
            type={booking.vehicle?.type || VehicleType.SEDAN}
            brand={booking.vehicle?.brand}
            model={booking.vehicle?.model}
            imageUrl={booking.vehicle?.imageUrl}
            size="md"
          />
          <span className="text-xs text-gray-500 font-mono">
            {booking.bookingNumber}
          </span>
        </div>

        <span className={`
          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${getBookingStatusColor(booking.status)}
        `}>
          {getBookingStatusName(booking.status)}
        </span>
      </div>

      {/* Route */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 text-sm">
          <span className="flex-1 font-medium text-gray-900 truncate">
            {booking.fromLocation}
          </span>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="flex-1 font-medium text-gray-900 truncate text-right">
            {booking.toLocation}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Дата:</span>
          <div className="font-medium text-gray-900">
            {formatDateTime(booking.createdAt)}
          </div>
        </div>

        <div className="text-right">
          <span className="text-gray-500">Стоимость:</span>
          <div className="font-bold text-primary-600">
            {formatTripPrice(booking.price, booking.toLocation)}
          </div>
        </div>
      </div>

      {/* Vehicle & Driver Info */}
      {(booking.vehicle || booking.driver) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {booking.vehicle && (
              <div>
                <span className="text-gray-500">Автомобиль:</span>
                <div className="font-medium text-gray-900">
                  {booking.vehicle.brand} {booking.vehicle.model}
                </div>
                {booking.vehicle.licensePlate && (
                  <div className="text-gray-600">
                    {booking.vehicle.licensePlate}
                  </div>
                )}
              </div>
            )}

            {booking.driver && (
              <div className="text-right">
                <span className="text-gray-500">Водитель:</span>
                <div className="font-medium text-gray-900">
                  {booking.driver.name}
                </div>
                {booking.driver.phone && (
                  <div className="text-gray-600">
                    {booking.driver.phone}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {booking.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Комментарий:</span>
          <p className="text-sm text-gray-700 mt-1">
            {booking.notes}
          </p>
        </div>
      )}

      {/* Action Arrow */}
      {isClickable && (
        <div className="flex justify-end mt-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
