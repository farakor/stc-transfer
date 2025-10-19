import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/services/store'
import { useCalculatePrice, useAllLocations } from '@/hooks/useRoutes'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { useTranslation } from '@/hooks/useTranslation'
import { ProgressBar } from '@/components/ProgressBar'
import { NotificationToast } from '@/components/NotificationToast'
import { LoadingScreen } from '@/components/LoadingScreen'
import { CustomSelect } from '@/components/CustomSelect'
import { LocationData } from '@/services/routeService'
import { ArrowLeft } from 'lucide-react'
import FarukBadge from '@/assets/faruk-badge.svg'
import STCLogo from '@/assets/STC-transfer.png'

export function RouteSelection() {
  const navigate = useNavigate()
  const { webApp } = useTelegramWebApp()
  const { t } = useTranslation()
  const {
    selectedVehicleType,
    fromLocation,
    toLocation,
    setFromLocation,
    setToLocation,
    setPriceCalculation,
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
  const [isCalculating, setIsCalculating] = useState(false)
  const [showCustomFromInput, setShowCustomFromInput] = useState(false)
  const [showCustomToInput, setShowCustomToInput] = useState(false)
  const [customFromLocation, setCustomFromLocation] = useState('')
  const [customToLocation, setCustomToLocation] = useState('')

  const calculatePriceMutation = useCalculatePrice()
  const { data: allLocations, isLoading: locationsLoading, error: locationsError } = useAllLocations()

  // Функция для получения иконки типа локации
  const getLocationTypeIcon = (type: string) => {
    return t.locationType[type as keyof typeof t.locationType] || t.locationType.other
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

  // Redirect if no vehicle selected (только после загрузки состояния из localStorage)
  useEffect(() => {
    if (hasHydrated && !selectedVehicleType) {
      navigate('/vehicles')
    }
  }, [hasHydrated, selectedVehicleType, navigate])

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
      if (value === t.route.other) {
        setShowCustomFromInput(true)
        setFromLocation('')
      } else {
        setShowCustomFromInput(false)
        setFromLocation(value)
      }
    } else {
      if (value === t.route.other) {
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
      setNotificationMessage(t.route.fillAllFields)
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
      setNotificationMessage(t.route.calculationError)
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
            {t.route.loadingError}
          </h1>
          <p className="text-gray-600 mb-4">
            {t.route.failedToLoadLocations}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            {t.route.tryAgain}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-[30px] z-20 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/vehicles')}
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

      <div className="px-4 py-8">
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
            {t.route.title}
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t.route.subtitle}
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
            <CustomSelect
              label={t.route.from}
              value={showCustomFromInput ? t.route.other : fromLocation}
              onChange={(value) => handleLocationChange('from', value)}
              options={fromLocations.map(loc => ({
                value: loc.value,
                label: loc.label
              }))}
              placeholder={t.route.selectFrom}
            />
            {showCustomFromInput && (
              <motion.input
                type="text"
                value={customFromLocation}
                onChange={(e) => handleCustomLocationChange('from', e.target.value)}
                placeholder={t.route.enterFromAddress}
                className="input mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>

          {/* To Location */}
          <div className="mb-6">
            <CustomSelect
              label={t.route.to}
              value={showCustomToInput ? t.route.other : toLocation}
              onChange={(value) => handleLocationChange('to', value)}
              options={toLocations.map(loc => {
                const isAvailable = isDestinationAvailable(loc.value, selectedVehicleType)
                return {
                  value: loc.value,
                  label: `${loc.label}${!isAvailable ? ` (${t.route.unavailable})` : ''}`,
                  disabled: !isAvailable
                }
              })}
              placeholder={t.route.selectTo}
            />
            {showCustomToInput && (
              <motion.input
                type="text"
                value={customToLocation}
                onChange={(e) => handleCustomLocationChange('to', e.target.value)}
                placeholder={t.route.enterToAddress}
                className="input mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>

          {/* Calculate Price Button */}
          <button
            onClick={handleCalculatePrice}
            disabled={isCalculating || !fromLocation || !toLocation}
            className="btn-primary w-full py-4 text-base"
          >
            {isCalculating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading-spinner"></div>
                <span>{t.route.calculating}</span>
              </div>
            ) : (
              t.route.calculatePrice
            )}
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 space-y-4 pb-8"
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
        type="error"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}
