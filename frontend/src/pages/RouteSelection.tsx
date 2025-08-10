import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/services/store'
import { useCalculatePrice } from '@/hooks/useRoutes'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { ProgressBar } from '@/components/ProgressBar'
import { NotificationToast } from '@/components/NotificationToast'

const BOOKING_STEPS = ['Язык', 'Транспорт', 'Маршрут', 'Данные', 'Подтверждение']

// Локации для поля "Откуда" (только отели и достопримечательности в городе)
const FROM_LOCATIONS = [
  'Hilton Samarkand Regency',
  'Silk Road by Minyoun',
  'Savitsky Plaza',
  'Lia! by Minyoun Stars of Ulugbek',
  'Hilton Garden Inn Samarkand Afrosiyob',
  'Hilton Garden Inn Samarkand Sogd',
  'Wellness Park Hotel Bactria',
  'Wellness Park Hotel Turon',
  'Конгресс центр',
  'Айван',
  'Вечный Город',
  'Фонтан',
  'Другое'
]

// Локации для поля "Куда" (все направления)
const TO_LOCATIONS = [
  'Hilton Samarkand Regency',
  'Silk Road by Minyoun',
  'Savitsky Plaza',
  'Lia! by Minyoun Stars of Ulugbek',
  'Hilton Garden Inn Samarkand Afrosiyob',
  'Hilton Garden Inn Samarkand Sogd',
  'Wellness Park Hotel Bactria',
  'Wellness Park Hotel Turon',
  'Конгресс центр',
  'Айван',
  'Вечный Город',
  'Фонтан',
  'Аэропорт',
  'Железнодорожный вокзал',
  'Поездка по Самарканду',
  'Экскурсия по Самарканду',
  'Поездка в Шахрисабз',
  'Поездка в Нурату',
  'Поездка в Бухару',
  'Поездка в Ташкент',
  'Поездка в Хиву',
  'Другое'
]

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
  const [showCustomFromInput, setShowCustomFromInput] = useState(false)
  const [showCustomToInput, setShowCustomToInput] = useState(false)
  const [customFromLocation, setCustomFromLocation] = useState('')
  const [customToLocation, setCustomToLocation] = useState('')

  const calculatePriceMutation = useCalculatePrice()

  // Функция для проверки доступности направления в зависимости от типа транспорта
  const isDestinationAvailable = (destination: string, vehicleType: string | null): boolean => {
    if (!vehicleType) return true

    // Правила отключения направлений
    const restrictions: Record<string, string[]> = {
      'MICROBUS': ['Поездка в Шахрисабз', 'Поездка в Нурату', 'Поездка в Хиву'], // Mercedes-Benz Sprinter
      'SEDAN': ['Поездка в Шахрисабз', 'Поездка в Нурату', 'Поездка в Бухару', 'Поездка в Ташкент', 'Поездка в Хиву'], // Hongqi EHS 5
      'PREMIUM': ['Поездка в Шахрисабз', 'Поездка в Нурату', 'Поездка в Бухару', 'Поездка в Ташкент', 'Поездка в Хиву'], // Hongqi EHS 9
      'MINIVAN': ['Поездка в Хиву'], // Kia Carnival
      'BUS': [] // Автобус Higer - без ограничений
    }

    const restrictedDestinations = restrictions[vehicleType] || []
    return !restrictedDestinations.includes(destination)
  }

  // Redirect if no vehicle selected
  useEffect(() => {
    if (!selectedVehicleType) {
      navigate('/vehicles')
    }
  }, [selectedVehicleType, navigate])

  // Очистить место назначения если оно стало недоступным при смене транспорта
  useEffect(() => {
    if (toLocation && selectedVehicleType && !isDestinationAvailable(toLocation, selectedVehicleType)) {
      setToLocation('')
      setShowCustomToInput(false)
      setCustomToLocation('')

      // Показать уведомление пользователю
      setNotificationMessage(`Направление "${toLocation}" недоступно для выбранного транспорта`)
      setShowNotification(true)
    }
  }, [selectedVehicleType, toLocation, setToLocation])

  const handleLocationChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      if (value === 'Другое') {
        setShowCustomFromInput(true)
        setFromLocation('')
      } else {
        setShowCustomFromInput(false)
        setFromLocation(value)
      }
    } else {
      if (value === 'Другое') {
        setShowCustomToInput(true)
        setToLocation('')
      } else {
        setShowCustomToInput(false)
        setToLocation(value)
      }
    }

    // Haptic feedback
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged()
    }
  }

  const handleCustomLocationChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setCustomFromLocation(value)
      setFromLocation(value)
    } else {
      setCustomToLocation(value)
      setToLocation(value)
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
            <select
              value={showCustomFromInput ? 'Другое' : fromLocation}
              onChange={(e) => handleLocationChange('from', e.target.value)}
              className="input"
            >
              <option value="">Выберите место отправления</option>
              {FROM_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {showCustomFromInput && (
              <input
                type="text"
                value={customFromLocation}
                onChange={(e) => handleCustomLocationChange('from', e.target.value)}
                placeholder="Введите адрес отправления"
                className="input mt-2"
              />
            )}
          </div>

          {/* To Location */}
          <div className="mb-6">
            <label className="label">Куда</label>
            <select
              value={showCustomToInput ? 'Другое' : toLocation}
              onChange={(e) => handleLocationChange('to', e.target.value)}
              className="input"
            >
              <option value="">Выберите место назначения</option>
              {TO_LOCATIONS.map((location) => {
                const isAvailable = isDestinationAvailable(location, selectedVehicleType)
                return (
                  <option
                    key={location}
                    value={location}
                    disabled={!isAvailable}
                    style={{
                      color: isAvailable ? 'inherit' : '#999',
                      backgroundColor: isAvailable ? 'inherit' : '#f5f5f5'
                    }}
                  >
                    {location} {!isAvailable ? '(недоступно)' : ''}
                  </option>
                )
              })}
            </select>
            {showCustomToInput && (
              <input
                type="text"
                value={customToLocation}
                onChange={(e) => handleCustomLocationChange('to', e.target.value)}
                placeholder="Введите адрес назначения"
                className="input mt-2"
              />
            )}
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
