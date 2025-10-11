import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAppStore } from '@/services/store'
import { useCreateBooking } from '@/hooks/useBookings'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { ProgressBar } from '@/components/ProgressBar'
import { NotificationToast } from '@/components/NotificationToast'
import { formatPrice, isSamarkandTrip } from '@/utils/formatting'
import { useSamarkandTariffs } from '@/hooks/useTariffs'
import { useVehicleTypes } from '@/hooks/useVehicles'
import { VehicleIcon } from '@/components/VehicleIcon'
import FarukBadge from '@/assets/faruk-badge.svg'

const BOOKING_STEPS = ['Язык', 'Транспорт', 'Маршрут', 'Данные', 'Подтверждение']

interface BookingFormData {
  pickupTime: string
  notes: string
}

export function BookingForm() {
  const navigate = useNavigate()
  const { webApp, user } = useTelegramWebApp()
  const {
    selectedVehicleType,
    fromLocation,
    toLocation,
    priceCalculation,
    setPickupTime,
    setNotes,
    currentStep,
    setCurrentStep
  } = useAppStore()

  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('error')

  const createBookingMutation = useCreateBooking()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>()
  
  // Получаем тарифы для поездок по Самарканду из API
  const { data: samarkandTariffs } = useSamarkandTariffs(selectedVehicleType || '')
  
  // Получаем типы машин из API
  const { data: vehicleTypes } = useVehicleTypes()
  
  // Находим выбранную машину
  const selectedVehicle = vehicleTypes?.find(v => v.type === selectedVehicleType)

  // Redirect if missing required data
  useEffect(() => {
    if (!selectedVehicleType || !fromLocation || !toLocation || !priceCalculation) {
      navigate('/vehicles')
    }
  }, [selectedVehicleType, fromLocation, toLocation, priceCalculation, navigate])

  // Set pickup time to now + 1 hour by default
  useEffect(() => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    const defaultTime = now.toISOString().slice(0, 16)
    setPickupTime(defaultTime)
  }, [setPickupTime])

  const onSubmit = async (data: BookingFormData) => {
    console.log('🔍 Form submission data:', data)
    console.log('🔍 User data:', user)
    console.log('🔍 Selected vehicle type:', selectedVehicleType)
    console.log('🔍 Price calculation:', priceCalculation)
    console.log('🔍 From/To locations:', { fromLocation, toLocation })

    if (!selectedVehicleType || !priceCalculation || !fromLocation || !toLocation) {
      console.error('❌ Missing required data for booking')
      setNotificationMessage('Недостаточно данных для создания заказа. Проверьте выбор транспорта и маршрута.')
      setNotificationType('error')
      setShowNotification(true)
      return
    }

    // Mock user ID if not available (for testing outside Telegram)
    const userId = user?.id || 12345

    try {
      await createBookingMutation.mutateAsync({
        telegramId: userId,
        fromLocation,
        toLocation,
        vehicleType: selectedVehicleType,
        pickupTime: data.pickupTime || undefined,
        notes: data.notes || undefined,
        distanceKm: priceCalculation.distance
      })

      // Save form data to store
      setPickupTime(data.pickupTime)
      setNotes(data.notes)
      setCurrentStep(4)

      setNotificationMessage('Заказ успешно создан!')
      setNotificationType('success')
      setShowNotification(true)

      // Navigate to confirmation after a short delay
      setTimeout(() => {
        navigate('/confirmation')
      }, 2000)

      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success')
      }
    } catch (error) {
      setNotificationMessage('Ошибка создания заказа. Попробуйте снова.')
      setNotificationType('error')
      setShowNotification(true)

      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error')
      }
    }
  }

  if (!priceCalculation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-8">
      <motion.div
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress Bar */}
        <ProgressBar
          steps={BOOKING_STEPS}
          currentStep={currentStep}
          className="mb-8"
        />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Оформление заказа
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Проверьте детали и заполните дополнительную информацию
          </motion.p>
        </div>

        {/* Order Summary */}
        <motion.div
          className="bg-white rounded-2xl shadow-card p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Детали заказа
          </h3>

          {/* Vehicle Type */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <VehicleIcon
              type={selectedVehicleType!}
              brand={selectedVehicle?.name?.split(' ')[0] || ''}
              model={selectedVehicle?.name?.split(' ').slice(1).join(' ') || ''}
              size="lg"
            />
            <div>
              <div className="font-medium text-gray-900">
                {selectedVehicle?.name || 'Загрузка...'}
              </div>
              <div className="text-sm text-gray-600">
                Выбранный транспорт
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex-1 font-medium text-gray-900">
                {fromLocation}
              </span>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="flex-1 font-medium text-gray-900 text-right">
                {toLocation}
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t pt-4">
            {isSamarkandTrip(toLocation) ? (
              <div className="text-center py-4">
                <div className="text-lg font-medium text-amber-600 mb-2">
                  ⏱️ Почасовая оплата
                </div>
                <div className="text-primary-600 font-semibold">
                  Сумма вычисляется после окончания поездки
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {samarkandTariffs ? (
                    `Тариф: ${formatPrice(samarkandTariffs.perKm)} за 1 км | ${formatPrice(samarkandTariffs.hourly)} за 1 час ожидания`
                  ) : (
                    'Загрузка тарифов...'
                  )}
                </div>
              </div>
            ) : (
              <>
                {priceCalculation.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{item.label}:</span>
                    <span className="font-medium">{formatPrice(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-bold text-primary-600 border-t pt-2 mt-2">
                  <span>Итого:</span>
                  <span>{formatPrice(priceCalculation.totalPrice)}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Booking Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-card p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Дополнительная информация
          </h3>

          {/* Pickup Time */}
          <div className="mb-4">
            <label className="label">Время подачи (опционально)</label>
            <input
              type="datetime-local"
              {...register('pickupTime')}
              className="input"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Если не указано, мы свяжемся с вами для уточнения времени
            </p>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="label">Комментарии к заказу (опционально)</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Особые пожелания, количество пассажиров, багаж..."
              className="input resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createBookingMutation.isPending}
            className="btn-primary w-full"
          >
            {createBookingMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner"></div>
                <span>Создание заказа...</span>
              </div>
            ) : (
              'Оформить заказ'
            )}
          </button>
        </motion.form>

        {/* Back Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => navigate('/route')}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Назад к выбору маршрута
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-2">Developed by</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </motion.div>
      </motion.div>

      {/* Notification Toast */}
      <NotificationToast
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}
