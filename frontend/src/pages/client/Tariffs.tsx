import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { VehicleType } from '@/types'
import { Lightbulb, Loader2, ArrowRight } from 'lucide-react'
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
        </div>

        {/* Vehicle Type Selector */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.tariffs.selectVehicle}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {vehicleTypes.map((vehicle) => {
              const models = vehicleTypeGroups[vehicle.id] || []
              const hasModels = models.length > 0
              
              // Получаем средние цены для этого типа транспорта
              let avgBasePrice = 0
              let avgPricePerKm = 0
              
              if (hasModels && tariffMatrix?.tariffs) {
                let totalBase = 0
                let totalPerKm = 0
                let count = 0
                
                Object.values(tariffMatrix.tariffs).forEach(routeTariffs => {
                  models.forEach(model => {
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
              
              return (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  disabled={!hasModels}
                  className={`
                    bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left
                    ${selectedVehicle === vehicle.id ? 'ring-2 ring-blue-600' : ''}
                    ${!hasModels ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <img src={vehicle.icon} alt={vehicle.name} className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600">{vehicle.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {hasModels ? `${models.length} моделей доступно` : 'Нет доступных моделей'}
                        </p>
                      </div>
                    </div>
                    {selectedVehicle === vehicle.id && hasModels && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {vehicle.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {hasModels && avgBasePrice > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-gray-600 text-xs">{t.tariffs.basePrice} (средн.)</p>
                          <p className="font-semibold text-gray-900">{avgBasePrice.toLocaleString()} сум</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs">{t.tariffs.perKm} (средн.)</p>
                          <p className="font-semibold text-gray-900">{avgPricePerKm.toLocaleString()} сум</p>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Popular Routes */}
        {selectedVehicleData && selectedVehicleModels.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t.tariffs.popularRoutes} ({selectedVehicleData.name})
            </h2>
            
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
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {route.from_location.name} → {route.to_location.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {distanceKm > 0 && <span>📏 {distanceKm} км</span>}
                            {route.estimated_duration_minutes && <span>⏱ {duration}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{t.tariffs.from}</p>
                          <p className="text-xl font-bold text-blue-600">
                            {price > 0 ? `${price.toLocaleString()} сум` : 'Уточняется'}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate('/vehicles')}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {t.tariffs.book}
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

