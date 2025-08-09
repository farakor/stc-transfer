import { prisma } from '@/utils/prisma'
import { VehicleService } from './vehicleService'
import { VehicleServiceMock } from './vehicleServiceMock'
import { VehicleType } from '@prisma/client'

export interface PriceCalculationRequest {
  from: string
  to: string
  vehicleType: VehicleType
  distance?: number
}

export interface PriceCalculationResult {
  routeId?: number
  routeType: string
  vehicleType: VehicleType
  basePrice: number
  pricePerKm: number
  distance: number
  totalPrice: number
  currency: string
  breakdown: {
    label: string
    amount: number
  }[]
}

export class RouteService {
  // Получить все активные маршруты
  static async getActiveRoutes() {
    return await prisma.route.findMany({
      orderBy: {
        from_city: 'asc'
      }
    })
  }

  // Найти маршрут по городам
  static async findRouteByLocations(fromCity: string, toCity: string) {
    try {
      return await prisma.route.findFirst({
        where: {
          from_city: fromCity,
          to_city: toCity
        }
      })
    } catch (error) {
      console.warn('⚠️ Database not available, using base pricing')
      return null
    }
  }

  // Рассчитать стоимость поездки
  static async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResult> {
    console.log('🔍 Calculating price for:', request)

    // Ищем существующий маршрут
    const route = await this.findRouteByLocations(request.from, request.to)
    console.log('📍 Found route:', route)

    // Получаем транспорт для расчета цены за км
    let vehicles;
    try {
      vehicles = await VehicleService.getVehiclesByType(request.vehicleType)
    } catch (error) {
      console.warn('⚠️ Database not available, using mock data')
      vehicles = await VehicleServiceMock.getVehiclesByType(request.vehicleType)
    }
    console.log('🚗 Found vehicles:', vehicles?.length || 0)

    const vehicle = vehicles[0]

    if (!vehicle) {
      console.error('❌ No vehicle found for type:', request.vehicleType)
      throw new Error(`Vehicle type ${request.vehicleType} not found`)
    }

    const pricePerKm = Number(vehicle.price_per_km)
    let distance = request.distance || 10 // Используем переданную дистанцию или базовое расстояние
    let basePrice = Number(route?.base_price || 0)
    let routeType = 'CUSTOM'

    if (route) {
      distance = route.distance
      basePrice = Number(route.base_price)
      routeType = 'FIXED'
    }

    const distancePrice = pricePerKm * distance
    const totalPrice = basePrice + distancePrice

    const result = {
      routeId: route?.id,
      routeType,
      vehicleType: request.vehicleType,
      basePrice,
      pricePerKm,
      distance,
      totalPrice,
      currency: 'UZS',
      breakdown: [
        {
          label: 'Базовая стоимость маршрута',
          amount: basePrice
        },
        {
          label: `Транспорт (${distance} км)`,
          amount: distancePrice
        }
      ]
    }

    console.log('✅ Price calculation result:', result)
    return result
  }

  // Получить популярные направления
  static async getPopularDestinations() {
    try {
      const popularRoutes = await prisma.route.findMany({
        where: {
          is_popular: true
        },
        orderBy: {
          from_city: 'asc'
        },
        take: 10
      })

      return popularRoutes.map(route => ({
        id: route.id,
        name: `${route.from_city} → ${route.to_city}`,
        fromCity: route.from_city,
        toCity: route.to_city,
        distance: route.distance,
        duration: route.duration,
        basePrice: route.base_price,
        type: this.getDestinationType(route.to_city),
        icon: this.getDestinationIcon(route.to_city)
      }))
    } catch (error) {
      console.warn('⚠️ Database not available for popular destinations, using mock data')
      // Возвращаем моковые популярные направления
      return [
        {
          id: 1,
          name: 'Самарканд → Ташкент',
          fromCity: 'Самарканд',
          toCity: 'Ташкент',
          distance: 300,
          duration: 240,
          basePrice: 100000,
          type: 'city',
          icon: '🏛️'
        },
        {
          id: 2,
          name: 'Бухара → Ташкент',
          fromCity: 'Бухара',
          toCity: 'Ташкент',
          distance: 450,
          duration: 300,
          basePrice: 120000,
          type: 'landmark',
          icon: '🕌'
        },
        {
          id: 3,
          name: 'Ташкент → Самарканд',
          fromCity: 'Ташкент',
          toCity: 'Самарканд',
          distance: 300,
          duration: 240,
          basePrice: 100000,
          type: 'city',
          icon: '🏛️'
        }
      ]
    }
  }

  private static getDestinationType(cityName: string): string {
    const name = cityName.toLowerCase()
    if (name.includes('самарканд')) return 'landmark'
    if (name.includes('бухара')) return 'landmark'
    if (name.includes('хива')) return 'landmark'
    return 'city'
  }

  private static getDestinationIcon(cityName: string): string {
    const name = cityName.toLowerCase()
    if (name.includes('самарканд')) return '🏛️'
    if (name.includes('бухара')) return '🕌'
    if (name.includes('хива')) return '🏰'
    if (name.includes('ташкент')) return '🏙️'
    if (name.includes('андижан')) return '🌾'
    if (name.includes('фергана')) return '🏔️'
    return '📍'
  }

  // Получить маршрут по ID
  static async getRouteById(id: number) {
    return await prisma.route.findUnique({
      where: { id }
    })
  }
}
