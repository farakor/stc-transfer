import { prisma } from '@/utils/prisma'
import { BookingStatus, VehicleType, RouteType, DriverStatus, VehicleStatus } from '@prisma/client'
import { VehicleService } from './vehicleService'
import { VehicleServiceMock } from './vehicleServiceMock'
import { UserServiceMock } from './userServiceMock'
import { BookingServiceMock } from './bookingServiceMock'
import { RouteService } from './routeService'
import { TelegramBotService } from './telegramBot'

export interface CreateBookingData {
  telegramId: bigint
  fromLocation: string
  toLocation: string
  vehicleType: VehicleType
  pickupTime?: string
  notes?: string
  distanceKm?: number
}

export interface BookingDetails {
  id: string
  status: BookingStatus
  fromLocation: string
  toLocation: string
  price: number
  pickupTime?: Date
  notes?: string
  user: {
    name?: string
    phone?: string
  }
  vehicle?: {
    brand: string
    model: string
    licensePlate: string
  }
  driver?: {
    name: string
    phone: string
  }
  createdAt: Date
}

export class BookingService {
  // Создать новый заказ
  static async createBooking(data: CreateBookingData): Promise<BookingDetails> {
    console.log('🔍 Creating booking for:', data)

    try {
      // 1. Найти или создать пользователя
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { telegram_id: String(data.telegramId) }
        })
      } catch (error) {
        console.warn('⚠️ Database not available for user lookup, using mock')
        user = await UserServiceMock.findByTelegramId(String(data.telegramId))
      }

      if (!user) {
        throw new Error('User not found. Please register first.')
      }

      // 2. Рассчитать стоимость
      const priceCalculation = await RouteService.calculatePrice({
        from: data.fromLocation,
        to: data.toLocation,
        vehicleType: data.vehicleType,
        distance: data.distanceKm
      })

      // 3. Найти подходящий автомобиль
      let vehicle;
      try {
        vehicle = await VehicleService.findSuitableVehicle(data.vehicleType)
      } catch (error) {
        console.warn('⚠️ Database not available for vehicle lookup, using mock')
        vehicle = await VehicleServiceMock.findSuitableVehicle(data.vehicleType)
      }

      // 4. Создать заказ
      let booking;
      try {
        booking = await prisma.booking.create({
          data: {
            user_id: user.id,
            from_location: data.fromLocation,
            to_location: data.toLocation,
            route_type: priceCalculation.routeType as RouteType,
            distance_km: priceCalculation.distance,
            price: priceCalculation.totalPrice,
            total_price: priceCalculation.totalPrice,
            passenger_count: 1,
            status: BookingStatus.PENDING,
            pickup_time: data.pickupTime ? new Date(data.pickupTime) : null,
            notes: data.notes,
            vehicle_id: vehicle?.id,
            driver_id: vehicle?.driver?.id,
            route_id: priceCalculation.routeId
          },
          include: {
            user: true,
            vehicle: true,
            driver: true,
            route: true
          }
        })
      } catch (error) {
        console.warn('⚠️ Database not available for booking creation, using mock')
        booking = await BookingServiceMock.createBooking({
          telegramId: data.telegramId,
          fromLocation: data.fromLocation,
          toLocation: data.toLocation,
          vehicleType: data.vehicleType,
          pickupTime: data.pickupTime,
          notes: data.notes,
          distance: priceCalculation.distance,
          totalPrice: priceCalculation.totalPrice
        })
      }

      // 5. Обновить статус автомобиля и водителя (если назначены)
      if (vehicle && vehicle.driver) {
        try {
          await Promise.all([
            VehicleService.updateVehicleStatus(vehicle.id, VehicleStatus.BUSY),
            prisma.driver.update({
              where: { id: vehicle.driver.id },
              data: { status: DriverStatus.BUSY }
            })
          ])
        } catch (error) {
          console.warn('⚠️ Could not update vehicle/driver status (DB unavailable)')
        }
      }

      // 6. Отправить уведомления
      try {
        const telegramBot = TelegramBotService.getInstance()

        // Уведомление клиенту
        await telegramBot.sendBookingNotification(Number(data.telegramId), {
          fromLocation: booking.from_location,
          toLocation: booking.to_location,
          vehicleType: data.vehicleType,
          price: booking.price
        })

        // Уведомление диспетчеру (можно добавить позже)
        // await telegramBot.sendDispatcherNotification(booking)

      } catch (error) {
        console.error('Failed to send notifications:', error)
        // Не прерываем процесс создания заказа из-за ошибок уведомлений
      }

      return this.formatBookingDetails(booking)
    } catch (error) {
      console.error('❌ Error in createBooking:', error)

      // Если не удается создать заказ обычным способом, используем полностью моковую версию
      const priceCalculation = await RouteService.calculatePrice({
        from: data.fromLocation,
        to: data.toLocation,
        vehicleType: data.vehicleType,
        distance: data.distanceKm
      })

      const booking = await BookingServiceMock.createBooking({
        telegramId: data.telegramId,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        vehicleType: data.vehicleType,
        pickupTime: data.pickupTime,
        notes: data.notes,
        distance: priceCalculation.distance,
        totalPrice: priceCalculation.totalPrice
      })

      return this.formatBookingDetails(booking)
    }
  }

  // Получить заказ по ID
  static async getBookingById(id: string): Promise<BookingDetails | null> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          vehicle: true,
          driver: true,
          route: true
        }
      })

      return booking ? this.formatBookingDetails(booking) : null
    } catch (error) {
      console.warn('⚠️ Database not available for booking lookup, using mock')
      const booking = await BookingServiceMock.findById(id)
      return booking ? this.formatBookingDetails(booking) : null
    }
  }

  // Получить заказы пользователя
  static async getUserBookings(telegramId: bigint, limit = 10) {
    try {
      const user = await prisma.user.findUnique({
        where: { telegram_id: String(telegramId) }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const bookings = await prisma.booking.findMany({
        where: { user_id: user.id },
        include: {
          user: true,
          vehicle: true,
          driver: true,
          route: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit
      })

      return bookings.map(booking => this.formatBookingDetails(booking))
    } catch (error) {
      console.warn('⚠️ Database not available for user bookings, using mock')
      const bookings = await BookingServiceMock.getUserBookings(String(telegramId))
      return bookings.map(booking => this.formatBookingDetails(booking))
    }
  }

  // Обновить статус заказа
  static async updateBookingStatus(id: string, status: BookingStatus, notes?: string) {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes })
      },
      include: {
        user: true,
        vehicle: true,
        driver: true
      }
    })

    // Освободить ресурсы при завершении или отмене
    if (status === BookingStatus.COMPLETED || status === BookingStatus.CANCELLED) {
      if (booking.vehicle_id && booking.driver_id) {
        await Promise.all([
          VehicleService.updateVehicleStatus(booking.vehicle_id!, VehicleStatus.AVAILABLE),
          prisma.driver.update({
            where: { id: booking.driver_id! },
            data: { status: DriverStatus.AVAILABLE }
          })
        ])
      }
    }

    // Отправить уведомление о смене статуса
    try {
      const telegramBot = TelegramBotService.getInstance()
      await telegramBot.sendStatusUpdateNotification(
        Number(booking.user.telegram_id),
        booking,
        status
      )
    } catch (error) {
      console.error('Failed to send status update notification:', error)
    }

    return this.formatBookingDetails(booking)
  }

  // Назначить водителя к заказу
  static async assignDriver(bookingId: string, driverId: string) {
    const driver = await prisma.driver.findUnique({
      where: { id: parseInt(driverId) },
      include: { vehicle: true }
    })

    if (!driver) {
      throw new Error('Driver not found')
    }

    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new Error('Driver is not available')
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driver_id: driver.id,
        vehicle_id: driver.vehicle_id,
        status: BookingStatus.CONFIRMED
      },
      include: {
        user: true,
        vehicle: true,
        driver: true
      }
    })

    // Обновить статус водителя и автомобиля
    await Promise.all([
      prisma.driver.update({
        where: { id: parseInt(driverId) },
        data: { status: DriverStatus.BUSY }
      }),
      VehicleService.updateVehicleStatus(driver.vehicle_id!, VehicleStatus.BUSY)
    ])

    return this.formatBookingDetails(booking)
  }

  // Получить активные заказы (для диспетчера)
  static async getActiveBookings() {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        }
      },
      include: {
        user: true,
        vehicle: true,
        driver: true,
        route: true
      },
      orderBy: {
        created_at: 'asc'
      }
    })

    return bookings.map(booking => this.formatBookingDetails(booking))
  }

  // Получить статистику заказов
  static async getBookingStats(period?: 'day' | 'week' | 'month') {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(0) // Все время
    }

    const [statusStats, totalRevenue, vehicleTypeStats] = await Promise.all([
      // Статистика по статусам
      prisma.booking.groupBy({
        by: ['status'],
        where: {
          created_at: { gte: startDate }
        },
        _count: {
          status: true
        }
      }),

      // Общая выручка
      prisma.booking.aggregate({
        where: {
          status: BookingStatus.COMPLETED,
          created_at: { gte: startDate }
        },
        _sum: {
          total_price: true
        }
      }),

      // Статистика по типам автомобилей
      prisma.booking.groupBy({
        by: ['vehicle_id'],
        where: {
          created_at: { gte: startDate },
          vehicle_id: { not: null }
        },
        _count: {
          vehicle_id: true
        },
        _sum: {
          total_price: true
        }
      })
    ])

    return {
      period,
      statusStats,
      totalRevenue: totalRevenue._sum.total_price || 0,
      vehicleTypeStats
    }
  }

  // Форматирование данных заказа
  private static formatBookingDetails(booking: any): BookingDetails {
    return {
      id: booking.id,
      status: booking.status,
      fromLocation: booking.from_location,
      toLocation: booking.to_location,
      price: Number(booking.price || booking.total_price || 0),
      pickupTime: booking.pickup_time,
      notes: booking.notes,
      user: {
        name: booking.user?.name || booking.user?.first_name,
        phone: booking.user?.phone
      },
      vehicle: booking.vehicle ? {
        brand: booking.vehicle.brand || booking.vehicle.name,
        model: booking.vehicle.model || '',
        licensePlate: booking.vehicle.license_plate || ''
      } : undefined,
      driver: booking.driver ? {
        name: booking.driver.name,
        phone: booking.driver.phone
      } : undefined,
      createdAt: booking.created_at
    }
  }
}
