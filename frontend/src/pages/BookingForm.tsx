import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAppStore } from '@/services/store'
import { useCreateBooking } from '@/hooks/useBookings'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { useTranslation } from '@/hooks/useTranslation'
import { ProgressBar } from '@/components/ProgressBar'
import { NotificationToast } from '@/components/NotificationToast'
import { CustomDateTimePicker } from '@/components/CustomDateTimePicker'
import { formatPrice, isSamarkandTrip } from '@/utils/formatting'
import { useSamarkandTariffs } from '@/hooks/useTariffs'
import { useVehicleTypes } from '@/hooks/useVehicles'
import { VehicleIcon } from '@/components/VehicleIcon'
import { ArrowLeft } from 'lucide-react'
import FarukBadge from '@/assets/faruk-badge.svg'
import STCLogo from '@/assets/STC-transfer.png'

interface BookingFormData {
  pickupTime: string
  notes: string
}

export function BookingForm() {
  const navigate = useNavigate()
  const { webApp, user } = useTelegramWebApp()
  const { t } = useTranslation()
  const {
    selectedVehicleType,
    fromLocation,
    toLocation,
    priceCalculation,
    pickupTime,
    notes,
    setPickupTime,
    setNotes,
    currentStep,
    setCurrentStep,
    hasHydrated
  } = useAppStore()
  
  const BOOKING_STEPS = [
    t.bookingSteps.language,
    t.bookingSteps.vehicle,
    t.bookingSteps.route,
    t.bookingSteps.details,
    t.bookingSteps.confirmation
  ]

  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('error')

  const createBookingMutation = useCreateBooking()
  const { handleSubmit } = useForm<BookingFormData>()
  
  // Получаем тарифы для поездок по Самарканду из API
  const { data: samarkandTariffs } = useSamarkandTariffs(selectedVehicleType || '')
  
  // Получаем типы машин из API
  const { data: vehicleTypes } = useVehicleTypes()
  
  // Находим выбранную машину
  const selectedVehicle = Array.isArray(vehicleTypes) ? vehicleTypes.find((v: any) => v.type === selectedVehicleType) : undefined
  
  // Отладка
  console.log('🚗 Selected Vehicle Type from store:', selectedVehicleType)
  console.log('🚗 Vehicle Types:', vehicleTypes)
  console.log('🚗 Selected Vehicle:', selectedVehicle)
  console.log('🚗 Brand:', selectedVehicle?.brand)
  console.log('🚗 Model:', selectedVehicle?.model)

  // Redirect if missing required data (только после загрузки состояния из localStorage)
  useEffect(() => {
    if (hasHydrated && (!selectedVehicleType || !fromLocation || !toLocation || !priceCalculation)) {
      navigate('/vehicles')
    }
  }, [hasHydrated, selectedVehicleType, fromLocation, toLocation, priceCalculation, navigate])

  // Set pickup time to now + 1 hour by default
  useEffect(() => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    const defaultTime = now.toISOString().slice(0, 16)
    setPickupTime(defaultTime)
  }, [setPickupTime])

  const onSubmit = async () => {
    console.log('🔍 Form submission')
    console.log('🔍 User data:', user)
    console.log('🔍 Selected vehicle type:', selectedVehicleType)
    console.log('🔍 Price calculation:', priceCalculation)
    console.log('🔍 From/To locations:', { fromLocation, toLocation })
    console.log('🔍 Pickup time:', pickupTime)
    console.log('🔍 Notes:', notes)

    if (!selectedVehicleType || !priceCalculation || !fromLocation || !toLocation) {
      console.error('❌ Missing required data for booking')
      setNotificationMessage(t.booking.insufficientData)
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
        pickupTime: pickupTime || undefined,
        notes: notes || undefined,
        distanceKm: priceCalculation.distance
      })

      setCurrentStep(4)

      setNotificationMessage(t.booking.orderCreated)
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
      setNotificationMessage(t.booking.orderError)
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-[35px] z-20 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/route')}
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
            {t.booking.title}
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t.booking.subtitle}
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
            {t.booking.orderDetails}
          </h3>

          {/* Vehicle Type */}
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <VehicleIcon
              type={selectedVehicleType!}
              brand={selectedVehicle?.brand || ''}
              model={selectedVehicle?.model || ''}
              imageUrl={selectedVehicle?.imageUrl}
              size="lg"
            />
            <div>
              <div className="font-medium text-gray-900">
                {selectedVehicle?.name || t.common.loading}
              </div>
              <div className="text-sm text-gray-600">
                {t.booking.selectedVehicle}
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
                  {t.booking.hourlyPayment}
                </div>
                <div className="text-primary-600 font-semibold">
                  {t.booking.calculatedAfterTrip}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {samarkandTariffs ? (
                    `${t.booking.tariff}: ${formatPrice((samarkandTariffs as any).perKm)} ${t.booking.perKm} | ${formatPrice((samarkandTariffs as any).hourly)} ${t.booking.perHour}`
                  ) : (
                    t.booking.loadingTariffs
                  )}
                </div>
              </div>
            ) : (
              <>
                {priceCalculation.breakdown.map((item: any, index: number) => {
                  // Переводим ключ, если это ключ локализации
                  let label = item.label
                  if (item.label === 'pricing.baseRouteCost') {
                    label = t.pricing.baseRouteCost
                  } else if (item.label === 'pricing.transportDistance') {
                    label = `${t.pricing.transportDistance} (${item.distance} ${t.confirmation.km})`
                  }
                  
                  return (
                    <div key={index} className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{label}:</span>
                      <span className="font-medium">{formatPrice(item.amount)}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between text-lg font-bold text-primary-600 border-t pt-2 mt-2">
                  <span>{t.booking.total}:</span>
                  <span>{formatPrice(priceCalculation.totalPrice)}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Booking Form */}
        <motion.form
          id="booking-form"
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-card p-6 mb-6 pb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t.booking.additionalInfo}
          </h3>

          {/* Pickup Time */}
          <CustomDateTimePicker
            value={pickupTime}
            onChange={setPickupTime}
            label={`${t.booking.pickupTime} (${t.common.optional})`}
            placeholder={t.booking.pickupTime}
            hint={t.booking.pickupTimeHint}
            min={new Date().toISOString().slice(0, 16)}
            className="mb-4"
          />

          {/* Notes */}
          <div className="mb-6">
            <label className="label">{t.booking.notes} ({t.common.optional})</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t.booking.notesPlaceholder}
              className="input resize-none"
            />
          </div>
        </motion.form>

        {/* Fixed Submit Button */}
        <div className="fixed bottom-8 left-0 right-0 px-4 z-10 safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <button
              type="submit"
              form="booking-form"
              disabled={createBookingMutation.isPending}
              className="btn-primary w-full py-4 text-base shadow-xl"
            >
              {createBookingMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span>{t.booking.submitting}</span>
                </div>
              ) : (
                t.booking.submitOrder
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-32 space-y-4 pb-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-2">{t.footer.developedBy}</p>
            <img src={FarukBadge} alt="Faruk" className="h-6 w-auto" />
          </div>
        </motion.div>
        </motion.div>
      </div>

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
