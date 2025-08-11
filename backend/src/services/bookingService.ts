import { prisma } from '@/utils/prisma'
import { BookingStatus, VehicleType, RouteType, DriverStatus, VehicleStatus } from '@prisma/client'
import { VehicleService } from './vehicleService'
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
      let user = await prisma.user.findUnique({
        where: { telegram_id: String(data.telegramId) }
      })

      if (!user) {
        // Автоматически создаем пользователя если его нет
        user = await prisma.user.create({
          data: {
            telegram_id: String(data.telegramId),
            language_code: 'ru'
          }
        })
      }

      // 2. Рассчитать стоимость
      const priceCalculation = await RouteService.calculatePrice({
        from: data.fromLocation,
        to: data.toLocation,
        vehicleType: data.vehicleType,
        distance: data.distanceKm
      })

      // 3. Найти подходящий автомобиль
      const vehicle = await VehicleService.findSuitableVehicle(data.vehicleType)

      // 4. Создать заказ
      const booking = await prisma.booking.create({
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

      // 5. Обновить статус автомобиля и водителя (если назначены)
      if (vehicle && vehicle.driver) {
        await Promise.all([
          VehicleService.updateVehicleStatus(vehicle.id, VehicleStatus.BUSY),
          prisma.driver.update({
            where: { id: vehicle.driver.id },
            data: { status: DriverStatus.BUSY }
          })
        ])
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

        // Уведомление диспетчеру
        await telegramBot.sendDispatcherNotification({
          id: booking.id,
          fromLocation: booking.from_location,
          toLocation: booking.to_location,
          vehicleType: data.vehicleType,
          price: booking.price,
          pickupTime: booking.pickup_time,
          notes: booking.notes,
          user: {
            name: booking.user.name || booking.user.first_name,
            phone: booking.user.phone
          }
        })

      } catch (error) {
        console.error('Failed to send notifications:', error)
        // Не прерываем процесс создания заказа из-за ошибок уведомлений
      }

      return this.formatBookingDetails(booking)
    } catch (error) {
      console.error('❌ Error in createBooking:', error)
      throw error
    }
  }

  // Получить заказ по ID
  static async getBookingById(id: string): Promise<BookingDetails | null> {
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
  }

  // Получить заказы пользователя
  static async getUserBookings(telegramId: bigint, limit = 10) {
    const user = await prisma.user.findUnique({
      where: { telegram_id: String(telegramId) }
    })

    if (!user) {
      return []
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

    // Отправить уведомление клиенту о назначении водителя
    try {
      const telegramBot = TelegramBotService.getInstance()
      await telegramBot.sendDriverAssignmentNotification(
        Number(booking.user.telegram_id),
        {
          fromLocation: booking.from_location,
          toLocation: booking.to_location,
          vehicle: booking.vehicle
        },
        booking.driver
      )
    } catch (error) {
      console.error('Failed to send driver assignment notification:', error)
    }

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

  // Начать рейс
  static async startTrip(bookingId: string, driverId: number, location?: { lat: number, lng: number }) {
    console.log(`🚀 Начинаем рейс ${bookingId} водителем ${driverId}`)

    // Проверяем, что заказ существует и имеет статус CONFIRMED
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        driver: true,
        vehicle: true
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PENDING) {
      throw new Error('Booking must be PENDING or CONFIRMED to start trip')
    }

    if (booking.driver_id !== driverId) {
      throw new Error('Driver is not assigned to this booking')
    }

    // Обновляем статус заказа
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.IN_PROGRESS,
        updated_at: new Date()
      },
      include: {
        user: true,
        driver: true,
        vehicle: true
      }
    })

    // Обновляем статус водителя
    await prisma.driver.update({
      where: { id: driverId },
      data: { status: DriverStatus.BUSY }
    })

    console.log(`✅ Рейс ${bookingId} начат`)

    // Отправляем уведомление клиенту
    try {
      if (booking.user.telegram_id) {
        const telegramBot = TelegramBotService.getInstance()
        await telegramBot.sendMessage(
          Number(booking.user.telegram_id),
          `🚗 Ваш рейс начат!\n\n` +
          `📍 Маршрут: ${booking.from_location} → ${booking.to_location}\n` +
          `👤 Водитель: ${booking.driver?.name}\n` +
          `📞 Телефон: ${booking.driver?.phone}\n` +
          `🚙 Автомобиль: ${booking.vehicle?.brand} ${booking.vehicle?.model}\n` +
          `🔢 Госномер: ${booking.vehicle?.license_plate}\n\n` +
          `Приятной поездки! 🛣️`
        )
      }
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления о начале рейса:', error)
    }

    return updatedBooking
  }

  // Завершить рейс
  static async completeTrip(bookingId: string, driverId: number, location?: { lat: number, lng: number }) {
    console.log(`✅ Завершаем рейс ${bookingId} водителем ${driverId}`)

    // Проверяем, что заказ существует и имеет статус IN_PROGRESS
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        driver: true,
        vehicle: true
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new Error('Booking is not in progress')
    }

    if (booking.driver_id !== driverId) {
      throw new Error('Driver is not assigned to this booking')
    }

    // Обновляем статус заказа
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        updated_at: new Date()
      },
      include: {
        user: true,
        driver: true,
        vehicle: true
      }
    })

    // Обновляем статус водителя
    await prisma.driver.update({
      where: { id: driverId },
      data: { status: DriverStatus.AVAILABLE }
    })

    console.log(`✅ Рейс ${bookingId} завершен`)

    // Отправляем уведомление клиенту
    try {
      if (booking.user.telegram_id) {
        const telegramBot = TelegramBotService.getInstance()
        await telegramBot.sendMessage(
          Number(booking.user.telegram_id),
          `✅ Ваш рейс завершен!\n\n` +
          `📍 Маршрут: ${booking.from_location} → ${booking.to_location}\n` +
          `💰 Стоимость: ${booking.price} сум\n` +
          `👤 Водитель: ${booking.driver?.name}\n\n` +
          `Спасибо за использование нашего сервиса! 🙏\n` +
          `Оцените поездку и оставьте отзыв.`
        )
      }
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления о завершении рейса:', error)
    }

    return updatedBooking
  }
}
