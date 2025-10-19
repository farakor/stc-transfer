import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { VehicleType } from '@/types'
import { Lightbulb, Loader2, ArrowRight, Users, Luggage } from 'lucide-react'
import { useTariffMatrix } from '@/hooks/useTariffs'
import SuvIcon from '@/assets/SUV.svg'
import SedanIcon from '@/assets/sedan-2.svg'
import MinivanIcon from '@/assets/minivan-4.svg'
import BusIcon from '@/assets/bus-2.svg'

export function Tariffs() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [selectedVehicle, setSelectedVehicle] = useState<string>('sedan')
  const { data: tariffMatrix, isLoading: tariffsLoading } = useTariffMatrix()

  const vehicleTypes = [
    {
      id: 'sedan',
      typeEnum: VehicleType.SEDAN,
      name: 'Седан',
      icon: SedanIcon,
      capacity: 4,
      description: 'Комфортный седан для небольших групп',
      features: [
        t.features.ac,
        t.features.comfort,
        t.features.luggage
      ]
    },
    {
      id: 'premium',
      typeEnum: VehicleType.PREMIUM,
      name: 'Премиум',
      icon: SuvIcon,
      capacity: 5,
      description: 'Премиальный внедорожник для комфортных поездок',
      features: [
        t.features.ac,
        t.features.comfort,
        t.features.luggage,
        t.features.spacious
      ]
    },
    {
      id: 'minivan',
      typeEnum: VehicleType.MINIVAN,
      name: 'Минивэн',
      icon: MinivanIcon,
      capacity: 7,
      description: 'Просторный минивэн для семей',
      features: [
        t.features.ac,
        t.features.spacious,
        t.features.bigLuggage,
        t.features.comfort
      ]
    },
    {
      id: 'bus',
      typeEnum: VehicleType.BUS,
      name: 'Автобус',
      icon: BusIcon,
      capacity: 50,
      description: 'Автобус для больших групп',
      features: [
        t.features.ac,
        t.features.toilet,
        t.features.wifi,
        t.features.tv,
        t.features.recliningSeat
      ]
    }
  ]

  // Получаем уникальные модели транспорта из тарифной матрицы
  const vehicleModelsFromMatrix = useMemo(() => {
    if (!tariffMatrix?.vehicleModels) return []
    return tariffMatrix.vehicleModels
  }, [tariffMatrix])

  // Получаем маршруты из тарифной матрицы
  const routesFromMatrix = useMemo(() => {
    if (!tariffMatrix?.routes) return []
    return tariffMatrix.routes.filter(route => route.is_active)
  }, [tariffMatrix])

  // Группируем модели по типам транспорта
  const vehicleTypeGroups = useMemo(() => {
    const groups: { [key: string]: typeof vehicleModelsFromMatrix } = {}
    vehicleModelsFromMatrix.forEach(model => {
      const type = model.type.toLowerCase()
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(model)
    })
    return groups
  }, [vehicleModelsFromMatrix])

  const getTariffForRoute = (routeId: number, vehicleBrand: string, vehicleModel: string) => {
    if (!tariffMatrix?.tariffs) return null
    const routeTariffs = tariffMatrix.tariffs[routeId]
    if (!routeTariffs) return null
    const vehicleKey = `${vehicleBrand}-${vehicleModel}`
    return routeTariffs[vehicleKey]
  }

  const calculateRoutePrice = (routeId: number, distanceKm: number, vehicleType: string) => {
    if (!tariffMatrix?.tariffs) return 0
    
    // Получаем модели для выбранного типа транспорта
    const models = vehicleTypeGroups[vehicleType]
    if (!models || models.length === 0) return 0
    
    // Берем первую модель для расчета (можно улучшить логику)
    const model = models[0]
    const tariff = getTariffForRoute(routeId, model.brand, model.model)
    
    if (!tariff) return 0
    
    const basePrice = tariff.base_price || 0
    const distancePrice = (tariff.price_per_km || 0) * distanceKm
    
    return basePrice + distancePrice
  }

  const selectedVehicleData = vehicleTypes.find(v => v.id === selectedVehicle)
  
  // Получаем модели для выбранного типа
  const selectedVehicleModels = useMemo(() => {
    return vehicleTypeGroups[selectedVehicle] || []
  }, [vehicleTypeGroups, selectedVehicle])

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.tariffs.title}
          </h1>
          <p className="text-gray-600 mt-2">{t.tariffs.selectVehicle}</p>
        </div>

        {/* Vehicle Type Tabs - Horizontal Scrollable */}
        <div className="relative -mx-4 px-4 py-2">
          <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory">
            {vehicleTypes.map((vehicle) => {
              const models = vehicleTypeGroups[vehicle.id] || []
              const hasModels = models.length > 0
              const isSelected = selectedVehicle === vehicle.id
              
              return (
                <button
                  key={vehicle.id}
                  onClick={() => hasModels && setSelectedVehicle(vehicle.id)}
                  disabled={!hasModels}
                  className={`
                    flex-shrink-0 snap-start transition-all duration-300
                    ${isSelected 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl scale-105' 
                      : hasModels 
                        ? 'bg-white text-gray-900 shadow-md hover:shadow-lg hover:scale-102' 
                        : 'bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                    }
                    rounded-2xl p-4 min-w-[140px] w-[140px]
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {/* Icon with background */}
                    <div className={`
                      p-3 rounded-xl transition-colors
                      ${isSelected ? 'bg-white/20' : 'bg-blue-50'}
                    `}>
                      <img 
                        src={vehicle.icon} 
                        alt={vehicle.name} 
                        className={`w-10 h-10 ${isSelected ? 'brightness-0 invert' : ''}`}
                      />
                    </div>
                    
                    {/* Name */}
                    <h3 className={`
                      font-semibold text-sm text-center
                      ${isSelected ? 'text-white' : 'text-gray-900'}
                    `}>
                      {vehicle.name}
                    </h3>
                    
                    {/* Capacity */}
                    <div className={`
                      flex items-center space-x-1 text-xs
                      ${isSelected ? 'text-white/90' : 'text-gray-600'}
                    `}>
                      <Users className="w-3 h-3" />
                      <span>{vehicle.capacity}</span>
                    </div>

                    {/* Status indicator */}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Vehicle Details Card */}
        {selectedVehicleData && selectedVehicleModels.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200 shadow-sm">
            <div className="flex items-start space-x-4 mb-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <img 
                  src={selectedVehicleData.icon} 
                  alt={selectedVehicleData.name} 
                  className="w-12 h-12"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {selectedVehicleData.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedVehicleData.description}
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-blue-700">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{selectedVehicleData.capacity} мест</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-700">
                    <Luggage className="w-4 h-4" />
                    <span className="font-medium">{selectedVehicleModels.length} моделей</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedVehicleData.features.map((feature, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1.5 bg-white text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Average Pricing */}
            {(() => {
              let avgBasePrice = 0
              let avgPricePerKm = 0
              
              if (tariffMatrix?.tariffs) {
                let totalBase = 0
                let totalPerKm = 0
                let count = 0
                
                Object.values(tariffMatrix.tariffs).forEach(routeTariffs => {
                  selectedVehicleModels.forEach(model => {
                    const vehicleKey = `${model.brand}-${model.model}`
                    const tariff = routeTariffs[vehicleKey]
                    if (tariff) {
                      totalBase += tariff.base_price || 0
                      totalPerKm += tariff.price_per_km || 0
                      count++
                    }
                  })
                })
                
                if (count > 0) {
                  avgBasePrice = Math.round(totalBase / count)
                  avgPricePerKm = Math.round(totalPerKm / count)
                }
              }

              return avgBasePrice > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">{t.tariffs.basePrice}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {avgBasePrice.toLocaleString()} <span className="text-sm font-normal text-gray-500">сум</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">{t.tariffs.perKm}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {avgPricePerKm.toLocaleString()} <span className="text-sm font-normal text-gray-500">сум</span>
                    </p>
                  </div>
                </div>
              ) : null
            })()}
          </div>
        )}

        {/* Popular Routes Section */}
        {selectedVehicleData && selectedVehicleModels.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {t.tariffs.popularRoutes}
              </h2>
              <span className="text-sm text-blue-600 font-medium">
                {selectedVehicleData.name}
              </span>
            </div>
            
            {tariffsLoading ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-600 mt-2">{t.common.loading}</p>
              </div>
            ) : routesFromMatrix.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <p className="text-gray-600">Нет доступных маршрутов</p>
                <p className="text-xs text-gray-500 mt-2">Создайте маршруты в админ-панели</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routesFromMatrix.slice(0, 5).map((route) => {
                  const distanceKm = route.distance_km || 0
                  const price = calculateRoutePrice(route.id, distanceKm, selectedVehicle)
                  const duration = route.estimated_duration_minutes 
                    ? `${Math.floor(route.estimated_duration_minutes / 60)}ч ${route.estimated_duration_minutes % 60}м`
                    : '-'
                  
                  return (
                    <div
                      key={route.id}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {route.from_location.name} → {route.to_location.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {distanceKm > 0 && (
                              <span className="flex items-center space-x-1">
                                <span>📏</span>
                                <span>{distanceKm} км</span>
                              </span>
                            )}
                            {route.estimated_duration_minutes && (
                              <span className="flex items-center space-x-1">
                                <span>⏱</span>
                                <span>{duration}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">{t.tariffs.from}</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {price > 0 ? `${price.toLocaleString()}` : '—'}
                          </p>
                          {price > 0 && <p className="text-xs text-gray-500">сум</p>}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate('/vehicles')}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <span>{t.tariffs.book}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Price Calculation Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">
                {t.tariffs.howCalculated}
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                {t.tariffs.calculation}
              </p>
              <p className="text-sm text-yellow-700">
                {t.tariffs.additionalInfo}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/vehicles')}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
        >
          <span>{t.tariffs.startBooking}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
    </div>
  )
}

