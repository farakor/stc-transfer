import { prisma } from '@/utils/prisma'
import { VehicleService } from './vehicleService'
import { VehicleType } from '@prisma/client'

export interface PriceCalculationRequest {
  from: string
  to: string
  vehicleType: VehicleType
  distance?: number
  hours?: number // для почасовой оплаты
}

export interface PriceCalculationResult {
  routeId?: number
  routeType: string
  vehicleType: VehicleType
  basePrice: number
  pricePerKm: number
  distance: number
  hours?: number // для почасовой оплаты
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
    return await prisma.route.findFirst({
      where: {
        from_city: fromCity,
        to_city: toCity
      }
    })
  }

  // Найти тариф в базе данных по локациям и типу транспорта
  static async findTariffFromDatabase(fromLocation: string, toLocation: string, vehicleType: string) {
    try {
      console.log(`🔍 Searching database tariff for: ${fromLocation} → ${toLocation}, vehicle: ${vehicleType}`)

      // Ищем маршрут по локациям
      const route = await prisma.tariffRoute.findFirst({
        where: {
          from_location: { name: fromLocation },
          to_location: { name: toLocation },
          is_active: true
        },
        include: {
          from_location: true,
          to_location: true
        }
      })

      if (!route) {
        console.log('❌ Route not found in database')
        return null
      }

      console.log('✅ Found route:', route.id, route.from_location.name, '→', route.to_location.name)

      // Получаем все транспортные средства с заданным типом
      const vehicles = await prisma.vehicle.findMany({
        where: {
          type: vehicleType as any
        },
        select: {
          brand: true,
          model: true
        }
      })

      if (vehicles.length === 0) {
        console.log('❌ No vehicles found for type:', vehicleType)
        return null
      }

      console.log(`✅ Found ${vehicles.length} vehicles of type ${vehicleType}:`, vehicles.map(v => `${v.brand} ${v.model}`))

      // Создаем условия поиска по всем найденным brand/model комбинациям
      const vehicleConditions = vehicles
        .filter(v => v.brand && v.model)
        .map(v => ({
          vehicle_brand: v.brand!,
          vehicle_model: v.model!
        }))

      if (vehicleConditions.length === 0) {
        console.log('❌ No valid brand/model combinations found')
        return null
      }

      // Ищем тариф для этого маршрута и типа транспорта
      const tariff = await prisma.tariff.findFirst({
        where: {
          route_id: route.id,
          is_active: true,
          OR: vehicleConditions
        },
        include: {
          route: {
            include: {
              from_location: true,
              to_location: true
            }
          }
        }
      })

      if (tariff) {
        console.log('✅ Found tariff:', tariff.id, tariff.vehicle_brand, tariff.vehicle_model)
        return {
          id: tariff.id,
          route_id: tariff.route_id,
          vehicle_brand: tariff.vehicle_brand,
          vehicle_model: tariff.vehicle_model,
          base_price: Number(tariff.base_price),
          price_per_km: Number(tariff.price_per_km),
          minimum_price: tariff.minimum_price ? Number(tariff.minimum_price) : undefined,
          night_surcharge_percent: tariff.night_surcharge_percent ? Number(tariff.night_surcharge_percent) : undefined,
          holiday_surcharge_percent: tariff.holiday_surcharge_percent ? Number(tariff.holiday_surcharge_percent) : undefined,
          waiting_price_per_minute: tariff.waiting_price_per_minute ? Number(tariff.waiting_price_per_minute) : undefined,
          is_active: tariff.is_active,
          route: {
            id: tariff.route.id,
            from_location: tariff.route.from_location,
            to_location: tariff.route.to_location,
            distance_km: tariff.route.distance_km ? Number(tariff.route.distance_km) : null,
            estimated_duration_minutes: tariff.route.estimated_duration_minutes,
            is_active: tariff.route.is_active
          }
        }
      }

      console.log('❌ Tariff not found for vehicle type:', vehicleType)
      return null

    } catch (error) {
      console.error('❌ Error searching database tariff:', error)
      return null
    }
  }


  // Рассчитать стоимость поездки
  static async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResult> {
    console.log('🔍 Calculating price for:', request)

    // Проверяем тарифы из базы данных
    const dbTariff = await this.findTariffFromDatabase(request.from, request.to, request.vehicleType)

    if (dbTariff) {
      console.log('💰 Using database tariff:', dbTariff)

      const distance = dbTariff.route.distance_km || 0
      const basePrice = dbTariff.base_price
      const pricePerKm = dbTariff.price_per_km
      const distancePrice = pricePerKm * distance
      const totalPrice = basePrice + distancePrice

      const result = {
        routeId: dbTariff.route.id,
        routeType: 'FIXED', // Используем FIXED для тарифов из БД
        vehicleType: request.vehicleType,
        basePrice,
        pricePerKm,
        distance,
        totalPrice,
        currency: 'UZS',
        breakdown: [
          {
            label: 'pricing.baseRouteCost',
            amount: basePrice
          },
          {
            label: 'pricing.transportDistance',
            amount: distancePrice,
            distance: distance
          }
        ]
      }

      console.log('✅ Database tariff calculation result:', result)
      return result
    }

    // Если тариф не найден в базе данных, выдаем ошибку
    console.error(`❌ Tariff not found for route: ${request.from} → ${request.to}, vehicle: ${request.vehicleType}`)
    throw new Error(
      `Тариф не найден для маршрута "${request.from} → ${request.to}" и типа транспорта "${request.vehicleType}". ` +
      `Пожалуйста, создайте тариф в админ-панели.`
    )
  }

  // Получить популярные направления
  static async getPopularDestinations() {
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
