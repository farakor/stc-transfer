import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/services/store'
import { useCalculatePrice, useAllLocations } from '@/hooks/useRoutes'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { ProgressBar } from '@/components/ProgressBar'
import { NotificationToast } from '@/components/NotificationToast'
import { LoadingScreen } from '@/components/LoadingScreen'
import { LocationData } from '@/services/routeService'
import FarukBadge from '@/assets/faruk-badge.svg'

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
  const [showCustomFromInput, setShowCustomFromInput] = useState(false)
  const [showCustomToInput, setShowCustomToInput] = useState(false)
  const [customFromLocation, setCustomFromLocation] = useState('')
  const [customToLocation, setCustomToLocation] = useState('')

  const calculatePriceMutation = useCalculatePrice()
  const { data: allLocations, isLoading: locationsLoading, error: locationsError } = useAllLocations()

  // Функция для получения иконки типа локации
  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'city': return '🏙️'
      case 'airport': return '✈️'
      case 'station': return '🚉'
      case 'attraction': return '🏛️'
      default: return '📍'
    }
  }

  // Мемоизированные списки локаций
  const fromLocations = useMemo(() => {
    if (!allLocations) return []

    // Для поля "Откуда" показываем все локации + опцию "Другое"
    const locations = allLocations.map(loc => ({
      value: loc.name,
      label: `${getLocationTypeIcon(loc.type)} ${loc.name}`,
      type: loc.type
    }))

    return [...locations, { value: 'Другое', label: 'Другое', type: 'other' }]
  }, [allLocations])

  const toLocations = useMemo(() => {
    if (!allLocations) return []

    // Для поля "Куда" показываем все локации + опцию "Другое"
    const locations = allLocations.map(loc => ({
      value: loc.name,
      label: `${getLocationTypeIcon(loc.type)} ${loc.name}`,
      type: loc.type
    }))

    return [...locations, { value: 'Другое', label: 'Другое', type: 'other' }]
  }, [allLocations])

  // Функция для проверки доступности направления в зависимости от типа транспорта
  const isDestinationAvailable = (destination: string, vehicleType: string | null): boolean => {
    if (!vehicleType) return true

    // Правила отключения направлений
    const restrictions: Record<string, string[]> = {
      'MICROBUS': ['Поездка в Шахрисабз', 'Поездка в Нурату', 'Поездка в Хиву'], // Mercedes-Benz Sprinter
      'SEDAN': ['Поездка в Шахрисабз', 'Поездка в Нурату', 'Поездка в Бухару', 'Поездка в Ташкент', 'Поездка в Хиву'], // Электромобиль Hongqi EHS 5
      'PREMIUM': ['Поездка в Шахрисабз', 'Поездка в Нурату', 'Поездка в Бухару', 'Поездка в Ташкент', 'Поездка в Хиву'], // Электромобиль Hongqi EHS 9
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

  // Показать экран загрузки если данные еще загружаются
  if (locationsLoading) {
    return <LoadingScreen />
  }

  // Показать ошибку если не удалось загрузить локации
  if (locationsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Ошибка загрузки
          </h1>
          <p className="text-gray-600 mb-4">
            Не удалось загрузить список локаций
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
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
              {fromLocations.map((location) => (
                <option key={location.value} value={location.value}>
                  {location.label}
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
              {toLocations.map((location) => {
                const isAvailable = isDestinationAvailable(location.value, selectedVehicleType)
                return (
                  <option
                    key={location.value}
                    value={location.value}
                    disabled={!isAvailable}
                    style={{
                      color: isAvailable ? 'inherit' : '#999',
                      backgroundColor: isAvailable ? 'inherit' : '#f5f5f5'
                    }}
                  >
                    {location.label} {!isAvailable ? '(недоступно)' : ''}
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
        type="error"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}
