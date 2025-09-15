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

      // Ищем тариф для этого маршрута и типа транспорта
      const tariff = await prisma.tariff.findFirst({
        where: {
          route_id: route.id,
          is_active: true,
          // Сопоставляем типы транспорта с брендами/моделями
          OR: [
            // Прямое сопоставление по типу транспорта
            { vehicle_brand: vehicleType },
            // Сопоставление по известным брендам
            ...(vehicleType === 'SEDAN' ? [
              { vehicle_brand: 'Hongqi', vehicle_model: 'EHS 5' },
              { vehicle_brand: 'Hongqi' }
            ] : []),
            ...(vehicleType === 'PREMIUM' ? [
              { vehicle_brand: 'Hongqi', vehicle_model: 'EHS 9' },
              { vehicle_brand: 'Mercedes', vehicle_model: 'S-Class' }
            ] : []),
            ...(vehicleType === 'MINIVAN' ? [
              { vehicle_brand: 'KIA', vehicle_model: 'Carnival' },
              { vehicle_brand: 'Kia', vehicle_model: 'Carnival' }
            ] : []),
            ...(vehicleType === 'MICROBUS' ? [
              { vehicle_brand: 'Mercedes', vehicle_model: 'Sprinter' }
            ] : []),
            ...(vehicleType === 'BUS' ? [
              { vehicle_brand: 'Higer', vehicle_model: 'Bus' }
            ] : [])
          ]
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

  // Фиксированные цены по маршрутам и типам транспорта (из нового прайс-листа)
  private static FIXED_PRICES: Record<string, Record<string, number>> = {
    // Отели и достопримечательности в городе - 20,000 сум для всех типов транспорта
    'Hilton Samarkand Regency': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Silk Road by Minyoun': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Savitsky Plaza': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Lia! by Minyoun Stars of Ulugbek': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Hilton Garden Inn Samarkand Afrosiyob': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Hilton Garden Inn Samarkand Sogd': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Wellness Park Hotel Bactria': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Wellness Park Hotel Turon': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Конгресс центр': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Айван': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Вечный Город': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },
    'Фонтан': {
      'BUS': 20000, 'MICROBUS': 20000, 'MINIVAN': 20000, 'PREMIUM': 20000, 'SEDAN': 20000
    },

    // Основные направления из прайс-листа
    'Аэропорт': {
      'BUS': 780000,           // Автобус Higer
      'MICROBUS': 650000,      // Mercedes Sprinter
      'MINIVAN': 400000,       // Kia Carnival
      'PREMIUM': 400000,       // Электромобиль Hongqi EHS 9
      'SEDAN': 150000          // Электромобиль Hongqi EHS 5
    },
    'Аэропорт Самарканда': {
      'BUS': 780000,
      'MICROBUS': 650000,
      'MINIVAN': 400000,
      'PREMIUM': 400000,
      'SEDAN': 150000
    },
    'Железнодорожный вокзал': {
      'BUS': 780000,
      'MICROBUS': 650000,
      'MINIVAN': 400000,
      'PREMIUM': 400000,
      'SEDAN': 150000
    },
    'Экскурсия по Самарканду': {
      'BUS': 2600000,          // Автобус Higer
      'MICROBUS': 3000000,     // Mercedes Sprinter
      'MINIVAN': 2000000,      // Kia Carnival
      'PREMIUM': 2000000,      // Электромобиль Hongqi EHS 9
      'SEDAN': 845000          // Электромобиль Hongqi EHS 5
    },
    'Поездка в Шахрисабз': {
      'SEDAN': 3500000,        // Электромобиль Hongqi EHS 5
      'MINIVAN': 2200000       // Kia Carnival
    },
    'Поездка в Нурату': {
      'SEDAN': 5200000,        // Электромобиль Hongqi EHS 5
      'MINIVAN': 3000000       // Kia Carnival
    },
    'Поездка в Бухару': {
      'SEDAN': 6100000,        // Электромобиль Hongqi EHS 5
      'MICROBUS': 3900000,     // Mercedes Sprinter
      'MINIVAN': 3600000       // Kia Carnival
    },
    'Поездка в Ташкент': {
      'SEDAN': 6500000,        // Электромобиль Hongqi EHS 5
      'MICROBUS': 4300000,     // Mercedes Sprinter
      'MINIVAN': 3900000       // Kia Carnival
    },
    'Поездка в Хиву': {
      // Цены не указаны в таблице (########)
    }
  }

  // Почасовые тарифы для поездок по Самарканду (из нового прайс-листа)
  private static HOURLY_RATES: Record<string, { hourly: number; perKm: number }> = {
    'BUS': { hourly: 325000, perKm: 0 },           // Автобус Higer: 325,000 за 1 час
    'PREMIUM': { hourly: 400000, perKm: 40000 },   // Электромобиль Hongqi EHS 9: 40,000 за 1 км + 400,000 за 1 час ожидания
    'SEDAN': { hourly: 150000, perKm: 15000 }      // Электромобиль Hongqi EHS 5: 15,000 за 1 км + 150,000 за 1 час ожидания
  }

  // Рассчитать стоимость поездки
  static async calculatePrice(request: PriceCalculationRequest): Promise<PriceCalculationResult> {
    console.log('🔍 Calculating price for:', request)

    const destination = request.to
    const vehicleType = request.vehicleType

    // СНАЧАЛА проверяем тарифы из базы данных
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
            label: 'Базовая стоимость маршрута',
            amount: basePrice
          },
          {
            label: `Транспорт (${distance} км)`,
            amount: distancePrice
          }
        ]
      }

      console.log('✅ Database tariff calculation result:', result)
      return result
    }

    // Если в БД нет тарифа, проверяем хардкодированные цены
    const fixedPrice = this.FIXED_PRICES[destination]?.[vehicleType]

    if (fixedPrice) {
      console.log(`💰 Using fixed price: ${fixedPrice} UZS for ${destination} with ${vehicleType}`)

      const result = {
        routeId: undefined,
        routeType: 'FIXED',
        vehicleType: request.vehicleType,
        basePrice: 0,
        pricePerKm: 0,
        distance: 0,
        totalPrice: fixedPrice,
        currency: 'UZS',
        breakdown: [
          {
            label: `Фиксированная стоимость: ${destination}`,
            amount: fixedPrice
          }
        ]
      }

      console.log('✅ Fixed price calculation result:', result)
      return result
    }

    // Специальная логика для поездок по Самарканду (почасовая оплата)
    if (destination === 'Поездка по Самарканду') {
      const hourlyRate = this.HOURLY_RATES[vehicleType]

      if (hourlyRate) {
        const hours = request.hours || 1 // По умолчанию 1 час
        const distance = request.distance || 0

        const hourlyPrice = hourlyRate.hourly * hours
        const distancePrice = hourlyRate.perKm * distance
        const totalPrice = hourlyPrice + distancePrice

        const result = {
          routeId: undefined,
          routeType: 'HOURLY',
          vehicleType: request.vehicleType,
          basePrice: 0,
          pricePerKm: hourlyRate.perKm,
          distance: distance,
          hours: hours,
          totalPrice,
          currency: 'UZS',
          breakdown: [
            {
              label: `Почасовая оплата (${hours} ч)`,
              amount: hourlyPrice
            },
            ...(distance > 0 ? [{
              label: `Пробег (${distance} км)`,
              amount: distancePrice
            }] : [])
          ]
        }

        console.log('✅ Hourly price calculation result:', result)
        return result
      }
    }

    // Для кастомных адресов - используем старую логику с расчетом по километражу
    return this.calculateCustomPrice(request)
  }

  // Расчет цены для кастомных маршрутов
  private static async calculateCustomPrice(request: PriceCalculationRequest): Promise<PriceCalculationResult> {
    console.log('🔍 Calculating custom price for:', request)

    // Ищем существующий маршрут
    const route = await this.findRouteByLocations(request.from, request.to)
    console.log('📍 Found route:', route)

    // Получаем транспорт для расчета цены за км
    const vehicles = await VehicleService.getVehiclesByType(request.vehicleType)
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

    console.log('✅ Custom price calculation result:', result)
    return result
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
