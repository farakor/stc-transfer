import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/services/store'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { useTranslation } from '@/hooks/useTranslation'
import { ProgressBar } from '@/components/ProgressBar'
import { NotificationToast } from '@/components/NotificationToast'
import {
  formatDateTime,
  getBookingStatusName,
  getBookingStatusColor,
  formatTripPrice
} from '@/utils/formatting'
import { useVehicleTypes } from '@/hooks/useVehicles'
import { VehicleIcon } from '@/components/VehicleIcon'
import { ArrowLeft } from 'lucide-react'
import FarukBadge from '@/assets/faruk-badge.svg'
import STCLogo from '@/assets/STC-transfer.png'

export function BookingConfirmation() {
  const navigate = useNavigate()
  const { webApp } = useTelegramWebApp()
  const { t } = useTranslation()
  const {
    currentBooking,
    selectedVehicleType,
    resetBookingFlow,
    hasHydrated
  } = useAppStore()
  
  const BOOKING_STEPS = [
    t.bookingSteps.language,
    t.bookingSteps.vehicle,
    t.bookingSteps.route,
    t.bookingSteps.details,
    t.bookingSteps.confirmation
  ]
  
  // Получаем типы машин из API
  const { data: vehicleTypes } = useVehicleTypes()
  
  // Находим выбранную машину
  const selectedVehicle = Array.isArray(vehicleTypes) ? vehicleTypes.find((v: any) => v.type === selectedVehicleType) : undefined

  const [showNotification, setShowNotification] = useState(false)
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false)

  // Проверяем наличие заказа при загрузке (только после загрузки состояния из localStorage)
  useEffect(() => {
    if (hasHydrated && !currentBooking) {
      // Если нет текущего заказа, перенаправляем на начало
      navigate('/vehicles')
    } else if (currentBooking) {
      setIsOrderConfirmed(true)
      setShowNotification(true)

      // Устанавливаем кнопки в Telegram Web App
      if (webApp) {
        webApp.MainButton.setText(t.confirmation.trackOrder)
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
  }, [hasHydrated, currentBooking, webApp, navigate])

  const handleViewStatus = () => {
    if (currentBooking) {
      navigate(`/status/${currentBooking.id}`)
    }
  }

  const handleNewOrder = () => {
    resetBookingFlow()
    navigate('/vehicles')
  }

  const handleContactSupport = () => {
    // Здесь можно добавить логику для связи с поддержкой
    window.open('https://t.me/stc_transfer_support', '_blank')
  }

  if (!currentBooking) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm safe-area-top">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleNewOrder}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <img 
              src={STCLogo} 
              alt="STC Transfer" 
              className="h-8 w-auto select-none absolute left-1/2 transform -translate-x-1/2" 
              style={{
                imageRendering: 'auto'
              }}
            />
            <div className="w-6"></div>
          </div>
        </div>
      </header>

      <div className="px-4 py-8 pb-24 safe-area-bottom">
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
            {t.confirmation.title}
          </motion.h1>

          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t.confirmation.subtitle} {t.confirmation.orderNumber}{currentBooking.bookingNumber}
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
            {t.confirmation.orderDetails}
          </h3>

          {/* Status */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">{t.confirmation.status}:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBookingStatusColor(currentBooking.status)}`}>
              {t.bookingStatus[currentBooking.status as keyof typeof t.bookingStatus] || currentBooking.status}
            </span>
          </div>

          {/* Vehicle Type */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <VehicleIcon
              type={currentBooking.vehicle?.type || selectedVehicleType!}
              brand={currentBooking.vehicle?.brand || selectedVehicle?.name?.split(' ')[0] || ''}
              model={currentBooking.vehicle?.model || selectedVehicle?.name?.split(' ').slice(1).join(' ') || ''}
              imageUrl={currentBooking.vehicle?.imageUrl || selectedVehicle?.imageUrl}
              size="lg"
            />
            <div>
              <div className="font-medium text-gray-900">
                {currentBooking.vehicle ?
                  `${currentBooking.vehicle.brand} ${currentBooking.vehicle.model}` :
                  (selectedVehicle?.name || t.common.loading)
                }
              </div>
              <div className="text-sm text-gray-600">
                {currentBooking.vehicle ?
                  t.confirmation.assignedVehicle :
                  t.confirmation.vehicleWillBeAssigned
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
                {t.confirmation.distance}: {currentBooking.distanceKm} {t.confirmation.km}
              </div>
            )}
          </div>

          {/* Pickup Time */}
          {currentBooking.pickupTime && (
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t.confirmation.pickupTime}:</span>
              <span className="text-sm text-gray-900">
                {formatDateTime(currentBooking.pickupTime)}
              </span>
            </div>
          )}

          {/* Notes */}
          {currentBooking.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-1">{t.confirmation.comments}:</div>
              <div className="text-sm text-gray-900">{currentBooking.notes}</div>
            </div>
          )}

          {/* Driver Info */}
          {currentBooking.driver && (
            <div className="mb-4 p-3 bg-primary-50 rounded-lg">
              <div className="text-sm font-medium text-primary-700 mb-2">{t.confirmation.driverInfo}:</div>
              <div className="text-sm text-primary-900">
                <div>{currentBooking.driver.name}</div>
                <div>{currentBooking.driver.phone}</div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold text-primary-600">
              <span>{t.confirmation.tripCost}:</span>
              <span>{formatTripPrice(currentBooking.price, currentBooking.toLocation)}</span>
            </div>
          </div>

          {/* Creation Time */}
          <div className="text-xs text-gray-500 text-center mt-4">
            {t.confirmation.orderCreated}: {formatDateTime(currentBooking.createdAt)}
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
            {t.confirmation.trackOrder}
          </button>

          <button
            onClick={handleContactSupport}
            className="btn-secondary w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {t.confirmation.contactSupport}
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
              <div className="font-medium mb-1">{t.confirmation.whatsNext}</div>
              <ul className="space-y-1 text-blue-700">
                {t.confirmation.whatsNextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
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
            {t.confirmation.newOrder}
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 space-y-4 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-2">{t.footer.developedBy}</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </motion.div>
        </motion.div>
      </div>

      {/* Success Notification */}
      <NotificationToast
        message={t.confirmation.orderCreatedNotification}
        type="success"
        isVisible={showNotification && isOrderConfirmed}
        onClose={() => setShowNotification(false)}
        duration={4000}
      />
      
      {/* Bottom fade/overlay for status bar */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-success-50 via-success-50/80 to-transparent pointer-events-none z-5 safe-area-bottom"></div>
    </div>
  )
}
