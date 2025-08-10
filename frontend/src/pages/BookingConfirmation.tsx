import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/services/store'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { ProgressBar } from '@/components/ProgressBar'
import { NotificationToast } from '@/components/NotificationToast'
import {
  formatDateTime,
  getBookingStatusName,
  getBookingStatusColor,
  getVehicleModelName,
  formatTripPrice,
  getRepresentativeVehicle
} from '@/utils/formatting'
import { VehicleIcon } from '@/components/VehicleIcon'

const BOOKING_STEPS = ['Язык', 'Транспорт', 'Маршрут', 'Данные', 'Подтверждение']

export function BookingConfirmation() {
  const navigate = useNavigate()
  const { webApp } = useTelegramWebApp()
  const {
    currentBooking,
    selectedVehicleType,
    resetBookingFlow
  } = useAppStore()

  const [showNotification, setShowNotification] = useState(false)
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false)

  // Проверяем наличие заказа при загрузке
  useEffect(() => {
    if (!currentBooking) {
      // Если нет текущего заказа, перенаправляем на начало
      navigate('/vehicles')
    } else {
      setIsOrderConfirmed(true)
      setShowNotification(true)

      // Устанавливаем кнопки в Telegram Web App
      if (webApp) {
        webApp.MainButton.setText('Посмотреть статус')
        webApp.MainButton.show()
        webApp.MainButton.onClick(handleViewStatus)

        webApp.BackButton.show()
        webApp.BackButton.onClick(handleNewOrder)

        if (webApp.HapticFeedback) {
          webApp.HapticFeedback.notificationOccurred('success')
        }
      }
    }

    return () => {
      if (webApp) {
        webApp.MainButton.hide()
        webApp.BackButton.hide()
      }
    }
  }, [currentBooking, webApp, navigate])

  const handleViewStatus = () => {
    if (currentBooking) {
      navigate(`/status/${currentBooking.id}`)
    }
  }

  const handleNewOrder = () => {
    resetBookingFlow()
    navigate('/language')
  }

  const handleContactSupport = () => {
    // Здесь можно добавить логику для связи с поддержкой
    window.open('https://t.me/stc_transfer_support', '_blank')
  }

  if (!currentBooking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50 px-4 py-8">
      <motion.div
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress Bar */}
        <ProgressBar
          steps={BOOKING_STEPS}
          currentStep={4}
          className="mb-8"
        />

        {/* Success Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <motion.h1
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Заказ подтвержден!
          </motion.h1>

          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Ваш заказ #{currentBooking.id.slice(0, 8)} успешно создан
          </motion.p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-card p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Детали заказа
          </h3>

          {/* Status */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Статус:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(currentBooking.status)}`}>
              {getBookingStatusName(currentBooking.status)}
            </span>
          </div>

          {/* Vehicle Type */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            {(() => {
              const vehicleType = currentBooking.vehicle?.type || selectedVehicleType!
              const representativeVehicle = getRepresentativeVehicle(vehicleType)

              return (
                <VehicleIcon
                  type={vehicleType}
                  brand={currentBooking.vehicle?.brand || representativeVehicle.brand}
                  model={currentBooking.vehicle?.model || representativeVehicle.model}
                  size="lg"
                />
              )
            })()}
            <div>
              <div className="font-medium text-gray-900">
                {currentBooking.vehicle ?
                  `${currentBooking.vehicle.brand} ${currentBooking.vehicle.model}` :
                  getVehicleModelName(selectedVehicleType!)
                }
              </div>
              <div className="text-sm text-gray-600">
                {currentBooking.vehicle ?
                  'Назначен автомобиль' :
                  'Автомобиль будет назначен'
                }
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex-1 font-medium text-gray-900">
                {currentBooking.fromLocation}
              </span>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="flex-1 font-medium text-gray-900 text-right">
                {currentBooking.toLocation}
              </span>
            </div>
            {currentBooking.distanceKm && (
              <div className="text-xs text-gray-500 text-center mt-1">
                Расстояние: {currentBooking.distanceKm} км
              </div>
            )}
          </div>

          {/* Pickup Time */}
          {currentBooking.pickupTime && (
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Время подачи:</span>
              <span className="text-sm text-gray-900">
                {formatDateTime(currentBooking.pickupTime)}
              </span>
            </div>
          )}

          {/* Notes */}
          {currentBooking.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">Комментарии:</div>
              <div className="text-sm text-gray-900">{currentBooking.notes}</div>
            </div>
          )}

          {/* Driver Info */}
          {currentBooking.driver && (
            <div className="mb-4 p-3 bg-primary-50 rounded-lg">
              <div className="text-sm font-medium text-primary-700 mb-2">Информация о водителе:</div>
              <div className="text-sm text-primary-900">
                <div>{currentBooking.driver.name}</div>
                <div>{currentBooking.driver.phone}</div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold text-primary-600">
              <span>Стоимость поездки:</span>
              <span>{formatTripPrice(currentBooking.price, currentBooking.toLocation)}</span>
            </div>
          </div>

          {/* Creation Time */}
          <div className="text-xs text-gray-500 text-center mt-4">
            Заказ создан: {formatDateTime(currentBooking.createdAt)}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={handleViewStatus}
            className="btn-primary w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Отследить заказ
          </button>

          <button
            onClick={handleContactSupport}
            className="btn-secondary w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Связаться с поддержкой
          </button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">Что дальше?</div>
              <ul className="space-y-1 text-blue-700">
                <li>• Мы найдем ближайшего водителя</li>
                <li>• Вы получите уведомление с деталями</li>
                <li>• Водитель свяжется с вами</li>
                <li>• Отслеживайте статус в реальном времени</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* New Order Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <button
            onClick={handleNewOrder}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Создать новый заказ
          </button>
        </motion.div>
      </motion.div>

      {/* Success Notification */}
      <NotificationToast
        message="Заказ успешно создан! Скоро с вами свяжется водитель."
        type="success"
        isVisible={showNotification && isOrderConfirmed}
        onClose={() => setShowNotification(false)}
        duration={4000}
      />
    </div>
  )
}
