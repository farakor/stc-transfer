import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useVehicleTypes } from '@/hooks/useVehicles'
import { useAppStore } from '@/services/store'
import { VehicleType } from '@/types'
import { formatPrice, getVehicleTypeIcon } from '@/utils/formatting'
import { LoadingScreen } from '@/components/LoadingScreen'

export function VehicleSelection() {
  const navigate = useNavigate()
  const { data: vehicleTypes, isLoading, error } = useVehicleTypes()
  const { selectedVehicleType, setSelectedVehicleType, setCurrentStep } = useAppStore()

  const handleVehicleSelect = (vehicleType: VehicleType) => {
    setSelectedVehicleType(vehicleType)
    setCurrentStep(1)
    navigate('/route')
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Ошибка загрузки
          </h1>
          <p className="text-gray-600 mb-4">
            Не удалось загрузить типы транспорта
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
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Выберите транспорт
          </motion.h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Подберите подходящий автомобиль для вашей поездки
          </motion.p>
        </div>

        {/* Vehicle Types */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {vehicleTypes?.map((vehicle, index) => (
            <motion.button
              key={vehicle.type}
              onClick={() => handleVehicleSelect(vehicle.type)}
              className="w-full p-6 bg-white rounded-2xl shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                {/* Vehicle Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-2xl">
                    {getVehicleTypeIcon(vehicle.type)}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {vehicle.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {vehicle.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                      👥 {vehicle.capacity} мест
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                      🧳 {vehicle.baggageCapacity} чемодана
                    </span>
                  </div>

                  {/* Price */}
                  {vehicle.basePrice && (
                    <div className="text-right">
                      <span className="text-xs text-gray-500">от </span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(vehicle.basePrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, featureIndex) => (
                    <span
                      key={featureIndex}
                      className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Back Button */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => navigate('/language')}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← Назад к выбору языка
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
