import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/services/store'
import { usePopularDestinations, useCalculatePrice } from '@/hooks/useRoutes'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { ProgressBar } from '@/components/ProgressBar'
import { LoadingScreen } from '@/components/LoadingScreen'
import { NotificationToast } from '@/components/NotificationToast'
import { formatPrice } from '@/utils/formatting'

const BOOKING_STEPS = ['Язык', 'Транспорт', 'Маршрут', 'Данные', 'Подтверждение']

export function RouteSelection() {
  const navigate = useNavigate()
  const { webApp } = useTelegramWebApp()
  const {
    selectedVehicleType,
    fromLocation,
    toLocation,
    setFromLocation,
    setToLocation,
    setPriceCalculation,
    currentStep,
    setCurrentStep
  } = useAppStore()

  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)

  const { data: popularDestinations, isLoading } = usePopularDestinations()
  const calculatePriceMutation = useCalculatePrice()

  // Redirect if no vehicle selected
  useEffect(() => {
    if (!selectedVehicleType) {
      navigate('/vehicles')
    }
  }, [selectedVehicleType, navigate])

  const handleLocationChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setFromLocation(value)
    } else {
      setToLocation(value)
    }

    // Haptic feedback
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged()
    }
  }

  const handlePopularDestinationSelect = (destination: any) => {
    if (!fromLocation) {
      setFromLocation(destination.fromLocation || 'Самарканд')
      setToLocation(destination.toLocation)
    } else {
      setToLocation(destination.toLocation)
    }

    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged()
    }
  }

  const handleCalculatePrice = async () => {
    if (!fromLocation || !toLocation || !selectedVehicleType) {
      setNotificationMessage('Пожалуйста, заполните все поля')
      setShowNotification(true)
      return
    }

    setIsCalculating(true)

    try {
      const calculation = await calculatePriceMutation.mutateAsync({
        fromLocation,
        toLocation,
        vehicleType: selectedVehicleType
      })

      setPriceCalculation(calculation)
      setCurrentStep(2)
      navigate('/booking')

      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('success')
      }
    } catch (error) {
      setNotificationMessage('Ошибка расчета стоимости. Попробуйте снова.')
      setShowNotification(true)

      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
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
            Выберите маршрут
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Укажите точки отправления и назначения
          </motion.p>
        </div>

        {/* Route Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-card p-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* From Location */}
          <div className="mb-4">
            <label className="label">Откуда</label>
            <input
              type="text"
              value={fromLocation}
              onChange={(e) => handleLocationChange('from', e.target.value)}
              placeholder="Введите адрес отправления"
              className="input"
            />
          </div>

          {/* To Location */}
          <div className="mb-6">
            <label className="label">Куда</label>
            <input
              type="text"
              value={toLocation}
              onChange={(e) => handleLocationChange('to', e.target.value)}
              placeholder="Введите адрес назначения"
              className="input"
            />
          </div>

          {/* Calculate Price Button */}
          <button
            onClick={handleCalculatePrice}
            disabled={isCalculating || !fromLocation || !toLocation}
            className="btn-primary w-full"
          >
            {isCalculating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner"></div>
                <span>Расчет стоимости...</span>
              </div>
            ) : (
              'Рассчитать стоимость'
            )}
          </button>
        </motion.div>

        {/* Popular Destinations */}
        {popularDestinations && popularDestinations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Популярные направления
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {popularDestinations.map((destination, index) => (
                <motion.button
                  key={destination.id}
                  onClick={() => handlePopularDestinationSelect(destination)}
                  className="p-3 bg-white rounded-xl shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-200 text-left"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{destination.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {destination.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {destination.type === 'airport' && 'Аэропорт'}
                        {destination.type === 'station' && 'Вокзал'}
                        {destination.type === 'landmark' && 'Достопримечательность'}
                        {destination.type === 'city' && 'Город'}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => navigate('/vehicles')}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Назад к выбору транспорта
          </button>
        </motion.div>
      </motion.div>

      {/* Notification Toast */}
      <NotificationToast
        message={notificationMessage}
        type="error"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}
