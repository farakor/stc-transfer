import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useVehicleTypes } from '@/hooks/useVehicles'
import { useAppStore } from '@/services/store'
import { VehicleType } from '@/types'
import { LoadingScreen } from '@/components/LoadingScreen'
import { VehicleIcon } from '@/components/VehicleIcon'
import { useTranslation } from '@/hooks/useTranslation'
import { ArrowLeft, Car } from 'lucide-react'
import FarukBadge from '@/assets/faruk-badge.svg'

export function VehicleSelection() {
  const navigate = useNavigate()
  const { data: vehicleTypes, isLoading, error } = useVehicleTypes()
  const { selectedVehicleType, setSelectedVehicleType, setCurrentStep } = useAppStore()
  const { t } = useTranslation()

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
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/client/dashboard')}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium">{t.common.back}</span>
            </button>
            <div className="flex items-center space-x-2">
              <Car className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">STC Transfer</h1>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
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
          {/* Title Section */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t.vehicle.title}
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {t.vehicle.subtitle}
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
              className="w-full p-6 bg-white rounded-2xl shadow-card border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-left"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.5 + index * 0.1,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
            >
              <div className="flex items-center space-x-4">
                {/* Vehicle Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 flex items-center justify-center">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="w-32 h-24 object-contain rounded-lg"
                      />
                    ) : (
                      <VehicleIcon
                        type={vehicle.type}
                        brand={vehicle.name?.split(' ')[0]}
                        model={vehicle.name?.split(' ').slice(1).join(' ')}
                        size="xl"
                      />
                    )}
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
                      👥 {vehicle.capacity} {t.vehicle.passengers}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                      🧳 {vehicle.baggageCapacity} {t.vehicle.pieces}
                    </span>
                    {vehicle.availableCount !== undefined && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium">
                        🚗 {vehicle.availableCount} {t.vehicle.availableVehicles}
                      </span>
                    )}
                  </div>


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

          {/* Footer */}
          <motion.div
            className="text-center mt-8 space-y-4"
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
    </div>
  )
}
