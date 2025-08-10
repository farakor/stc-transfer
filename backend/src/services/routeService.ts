import { prisma } from '@/utils/prisma'
import { VehicleService } from './vehicleService'
import { VehicleServiceMock } from './vehicleServiceMock'
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

    // Проверяем, есть ли фиксированная цена для данного маршрута и типа транспорта
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

    console.log('✅ Custom price calculation result:', result)
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
