import { prisma } from '@/utils/prisma'
import { BookingStatus, DriverStatus, VehicleStatus, VehicleType } from '@prisma/client'
import { TelegramBotService } from './telegramBot'

interface BookingFilter {
  status?: string
  dateFrom?: string
  dateTo?: string
  driverId?: string
  search?: string
}

interface PaginationParams {
  page: number
  limit: number
}

export class AdminService {
  // Получить все заказы с фильтрацией и пагинацией
  static async getAllBookings(filter: BookingFilter, pagination: PaginationParams) {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Строим условие фильтрации
    const where: any = {}

    if (filter.status && filter.status !== 'ALL') {
      where.status = filter.status as BookingStatus
    }

    if (filter.dateFrom || filter.dateTo) {
      where.created_at = {}
      if (filter.dateFrom) {
        where.created_at.gte = new Date(filter.dateFrom)
      }
      if (filter.dateTo) {
        where.created_at.lte = new Date(filter.dateTo)
      }
    }

    if (filter.driverId) {
      where.driver_id = Number(filter.driverId)
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase()
      where.OR = [
        { id: { contains: searchTerm } },
        { from_location: { contains: searchTerm, mode: 'insensitive' } },
        { to_location: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { first_name: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm } }
            ]
          }
        }
      ]
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: true,
          vehicle: true,
          driver: true,
          route: true
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.booking.count({ where })
    ])

    return {
      bookings: bookings.map(booking => this.formatBookingForAdmin(booking)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  // Получить всех водителей
  static async getAllDrivers() {
    const drivers = await prisma.driver.findMany({
      include: {
        vehicle: true,
        bookings: {
          where: {
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return drivers.map(driver => ({
      id: driver.id.toString(),
      name: driver.name,
      phone: driver.phone,
      license: driver.license,
      status: driver.status,
      vehicle: driver.vehicle ? {
        id: driver.vehicle.id.toString(),
        brand: driver.vehicle.brand,
        model: driver.vehicle.model,
        type: driver.vehicle.type,
        licensePlate: driver.vehicle.license_plate
      } : null,
      recentBookings: driver.bookings.length,
      createdAt: driver.created_at.toISOString(),
      updatedAt: driver.updated_at.toISOString()
    }))
  }

  // Получить доступных водителей
  static async getAvailableDrivers() {
    const drivers = await prisma.driver.findMany({
      where: {
        status: DriverStatus.AVAILABLE
      },
      include: {
        vehicle: true
      }
    })

    return drivers.map(driver => ({
      id: driver.id.toString(),
      name: driver.name,
      phone: driver.phone,
      license: driver.license,
      status: driver.status,
      vehicle: driver.vehicle ? {
        id: driver.vehicle.id.toString(),
        brand: driver.vehicle.brand,
        model: driver.vehicle.model,
        type: driver.vehicle.type,
        licensePlate: driver.vehicle.license_plate
      } : null
    }))
  }

  // Создать водителя
  static async createDriver(data: {
    name: string
    phone: string
    license: string
    vehicleId?: number
  }) {
    const driver = await prisma.driver.create({
      data: {
        name: data.name,
        phone: data.phone,
        license: data.license,
        status: DriverStatus.AVAILABLE,
        vehicle_id: data.vehicleId || null
      },
      include: {
        vehicle: true
      }
    })

    return {
      id: driver.id.toString(),
      name: driver.name,
      phone: driver.phone,
      license: driver.license,
      status: driver.status,
      vehicle: driver.vehicle ? {
        id: driver.vehicle.id.toString(),
        brand: driver.vehicle.brand,
        model: driver.vehicle.model,
        type: driver.vehicle.type,
        licensePlate: driver.vehicle.license_plate
      } : null,
      createdAt: driver.created_at.toISOString()
    }
  }

  // Обновить водителя
  static async updateDriver(id: number, data: any) {
    const driver = await prisma.driver.findUnique({
      where: { id }
    })

    if (!driver) {
      throw new Error('Driver not found')
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.license && { license: data.license }),
        ...(data.status && { status: data.status }),
        ...(data.vehicleId && { vehicle_id: parseInt(data.vehicleId) }),
        updated_at: new Date()
      },
      include: {
        vehicle: true
      }
    })

    return {
      id: updatedDriver.id.toString(),
      name: updatedDriver.name,
      phone: updatedDriver.phone,
      license: updatedDriver.license,
      status: updatedDriver.status,
      vehicle: updatedDriver.vehicle ? {
        id: updatedDriver.vehicle.id.toString(),
        brand: updatedDriver.vehicle.brand,
        model: updatedDriver.vehicle.model,
        type: updatedDriver.vehicle.type,
        licensePlate: updatedDriver.vehicle.license_plate
      } : null,
      updatedAt: updatedDriver.updated_at.toISOString()
    }
  }

  // Удалить водителя
  static async deleteDriver(id: number) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
            }
          }
        }
      }
    })

    if (!driver) {
      throw new Error('Driver not found')
    }

    if (driver.bookings.length > 0) {
      throw new Error('Cannot delete driver with active bookings')
    }

    await prisma.driver.delete({
      where: { id }
    })

    return { success: true }
  }

  // Получить все автомобили
  static async getAllVehicles() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return vehicles.map(vehicle => ({
      id: vehicle.id.toString(),
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      capacity: vehicle.capacity,
      licensePlate: vehicle.license_plate,
      status: vehicle.status,
      pricePerKm: Number(vehicle.price_per_km),
      driver: vehicle.driver ? {
        id: vehicle.driver.id.toString(),
        name: vehicle.driver.name,
        phone: vehicle.driver.phone,
        status: vehicle.driver.status
      } : null,
      createdAt: vehicle.created_at.toISOString(),
      updatedAt: vehicle.updated_at.toISOString()
    }))
  }

  // Создать автомобиль
  static async createVehicle(data: any) {
    const vehicle = await prisma.vehicle.create({
      data: {
        type: data.type as VehicleType,
        name: data.name,
        brand: data.brand,
        model: data.model,
        capacity: data.capacity,
        price_per_km: data.pricePerKm,
        license_plate: data.licensePlate,
        status: VehicleStatus.AVAILABLE,
        description: data.description,
        features: data.features || []
      }
    })

    return {
      id: vehicle.id.toString(),
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type,
      capacity: vehicle.capacity,
      licensePlate: vehicle.license_plate,
      status: vehicle.status,
      pricePerKm: Number(vehicle.price_per_km),
      createdAt: vehicle.created_at.toISOString()
    }
  }

  // Обновить автомобиль
  static async updateVehicle(id: number, data: any) {
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.brand && { brand: data.brand }),
        ...(data.model && { model: data.model }),
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.pricePerKm && { price_per_km: data.pricePerKm }),
        ...(data.licensePlate && { license_plate: data.licensePlate }),
        ...(data.status && { status: data.status }),
        ...(data.description && { description: data.description }),
        ...(data.features && { features: data.features }),
        updated_at: new Date()
      },
      include: {
        driver: true
      }
    })

    return {
      id: updatedVehicle.id.toString(),
      brand: updatedVehicle.brand,
      model: updatedVehicle.model,
      type: updatedVehicle.type,
      capacity: updatedVehicle.capacity,
      licensePlate: updatedVehicle.license_plate,
      status: updatedVehicle.status,
      pricePerKm: Number(updatedVehicle.price_per_km),
      driver: updatedVehicle.driver ? {
        id: updatedVehicle.driver.id.toString(),
        name: updatedVehicle.driver.name,
        phone: updatedVehicle.driver.phone,
        status: updatedVehicle.driver.status
      } : null,
      updatedAt: updatedVehicle.updated_at.toISOString()
    }
  }

  // Удалить автомобиль
  static async deleteVehicle(id: number) {
    await prisma.vehicle.delete({
      where: { id }
    })

    return { success: true }
  }

  // Аналитика выручки
  static async getRevenueAnalytics(period: string) {
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
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // По умолчанию неделя
    }

    console.log(`📊 Аналитика выручки: период=${period}, startDate=${startDate}`)

    // Получить общую выручку (все статусы, не только COMPLETED)
    const revenue = await prisma.booking.aggregate({
      where: {
        created_at: {
          gte: startDate
        }
      },
      _sum: {
        total_price: true
      },
      _count: {
        id: true
      }
    })

    // Также получаем выручку только по завершенным заказам
    const completedRevenue = await prisma.booking.aggregate({
      where: {
        status: BookingStatus.COMPLETED,
        created_at: {
          gte: startDate
        }
      },
      _sum: {
        total_price: true
      },
      _count: {
        id: true
      }
    })

    console.log(`📊 Найдено заказов: всего=${revenue._count.id}, завершено=${completedRevenue._count.id}`)
    console.log(`📊 Выручка: всего=${revenue._sum.total_price}, завершено=${completedRevenue._sum.total_price}`)

    // Получить данные по дням для графика (все заказы)
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(total_price) as revenue,
        COUNT(*) as bookings
      FROM "Booking"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date;
    `

    console.log(`📊 Ежедневные данные:`, dailyRevenue)

    return {
      totalRevenue: Number(revenue._sum.total_price || 0),
      completedRevenue: Number(completedRevenue._sum.total_price || 0),
      totalBookings: revenue._count.id,
      completedBookings: completedRevenue._count.id,
      period,
      dailyData: dailyRevenue
    }
  }

  // Популярные маршруты
  static async getPopularRoutes() {
    console.log('📊 Запрос популярных маршрутов...')

    const routes = await prisma.booking.groupBy({
      by: ['from_location', 'to_location'],
      _count: {
        id: true
      },
      _sum: {
        total_price: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    console.log(`📊 Найдено маршрутов: ${routes.length}`)

    const result = routes
      .filter(route => route.from_location && route.to_location) // Фильтруем пустые значения
      .map(route => ({
        fromLocation: route.from_location,
        toLocation: route.to_location,
        bookingsCount: route._count.id,
        totalRevenue: Number(route._sum.total_price || 0)
      }))

    console.log('📊 Популярные маршруты:', result)
    return result
  }

  // Производительность водителей
  static async getDriverPerformance() {
    console.log('📊 Запрос производительности водителей...')

    const performance = await prisma.driver.findMany({
      include: {
        bookings: {
          where: {
            status: BookingStatus.COMPLETED,
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Последние 30 дней
            }
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: BookingStatus.COMPLETED
              }
            }
          }
        }
      }
    })

    console.log(`📊 Найдено водителей: ${performance.length}`)

    const result = performance.map(driver => {
      const totalRevenue = driver.bookings.reduce((sum, booking) =>
        sum + Number(booking.total_price), 0
      )

      return {
        driverId: driver.id.toString(),
        name: driver.name,
        phone: driver.phone,
        status: driver.status,
        completedOrders: driver._count.bookings,
        totalRevenue,
        avgRating: 4.5, // TODO: Добавить систему рейтингов
        avgResponseTime: 5, // TODO: Добавить трекинг времени ответа
        efficiency: driver._count.bookings > 0 ? Math.min(95, 70 + driver._count.bookings / 2) : 0
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue)

    console.log(`📊 Водители с данными:`, result)
    return result
  }

  // Метрики в реальном времени
  static async getRealTimeMetrics() {
    console.log('📊 Запрос метрик в реальном времени...')
    const today = new Date(new Date().setHours(0, 0, 0, 0))

    const [activeOrders, drivers, pendingOrders, todayStats, allBookings] = await Promise.all([
      // Активные заказы
      prisma.booking.count({
        where: {
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
          }
        }
      }),

      // Водители
      prisma.driver.findMany({
        select: {
          status: true
        }
      }),

      // Ожидающие заказы
      prisma.booking.count({
        where: {
          status: BookingStatus.PENDING
        }
      }),

      // Статистика за сегодня
      prisma.booking.aggregate({
        where: {
          created_at: {
            gte: today
          }
        },
        _sum: {
          total_price: true
        },
        _count: {
          id: true
        }
      }),

      // Все заказы для проверки
      prisma.booking.count()
    ])

    console.log(`📊 Всего заказов в БД: ${allBookings}`)
    console.log(`📊 Заказов за сегодня: ${todayStats._count.id}`)
    console.log(`📊 Активных заказов: ${activeOrders}`)
    console.log(`📊 Ожидающих заказов: ${pendingOrders}`)
    console.log(`📊 Водителей: ${drivers.length}`)

    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length
    const busyDrivers = drivers.filter(d => d.status === 'BUSY').length

    // Подсчет завершенных заказов за сегодня
    const completedToday = await prisma.booking.count({
      where: {
        status: BookingStatus.COMPLETED,
        created_at: {
          gte: today
        }
      }
    })

    const completionRate = todayStats._count.id > 0 
      ? (completedToday / todayStats._count.id) * 100 
      : 0

    const currentHour = new Date().getHours() || 1 // Избегаем деления на 0

    const result = {
      activeOrders,
      availableDrivers,
      busyDrivers,
      avgResponseTime: 4, // TODO: Добавить реальный расчет
      pendingOrders,
      completionRate: Math.round(completionRate * 10) / 10,
      currentRevenue: Number(todayStats._sum.total_price || 0),
      ordersPerHour: Math.round(todayStats._count.id / currentHour),
      totalBookingsInDb: allBookings // Для отладки
    }

    console.log('📊 Результат метрик:', result)
    return result
  }

  // Статистика по статусам заказов
  static async getOrdersStatusData(period?: 'day' | 'week' | 'month') {
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // По умолчанию 30 дней
    }

    console.log(`📊 Статистика статусов: период=${period}, startDate=${startDate}`)

    const statusStats = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        created_at: { gte: startDate }
      },
      _count: {
        status: true
      }
    })

    console.log(`📊 Статусы заказов:`, statusStats)

    const total = statusStats.reduce((sum, stat) => sum + stat._count.status, 0)

    const result = statusStats.map(stat => ({
      status: stat.status,
      count: stat._count.status,
      percentage: total > 0 ? Math.round((stat._count.status / total) * 1000) / 10 : 0
    }))

    console.log(`📊 Результат статусов (всего=${total}):`, result)

    return result
  }

  // Массовые операции с заказами
  static async bulkUpdateBookings(bookingIds: string[], action: string, driverId?: string) {
    switch (action) {
      case 'cancel':
        // Получаем заказы с информацией о водителях и автомобилях
        const bookingsToCancel = await prisma.booking.findMany({
          where: { id: { in: bookingIds } },
          include: { user: true, vehicle: true, driver: true }
        })

        await prisma.booking.updateMany({
          where: {
            id: { in: bookingIds }
          },
          data: {
            status: BookingStatus.CANCELLED
          }
        })

        // Освобождаем ресурсы (автомобили и водителей)
        const vehicleUpdates = []
        const driverUpdates = []
        
        for (const booking of bookingsToCancel) {
          if (booking.vehicle_id) {
            vehicleUpdates.push(
              prisma.vehicle.update({
                where: { id: booking.vehicle_id },
                data: { status: VehicleStatus.AVAILABLE, updated_at: new Date() }
              })
            )
          }
          if (booking.driver_id) {
            driverUpdates.push(
              prisma.driver.update({
                where: { id: booking.driver_id },
                data: { status: DriverStatus.AVAILABLE, updated_at: new Date() }
              })
            )
          }
        }

        // Выполняем все обновления параллельно
        await Promise.all([...vehicleUpdates, ...driverUpdates])

        // Отправить уведомления клиентам
        const telegramBot = TelegramBotService.getInstance()
        for (const booking of bookingsToCancel) {
          try {
            await telegramBot.sendNotification(
              Number(booking.user.telegram_id),
              `❌ Заказ отменен\n\nВаш заказ ${booking.id} был отменен. Приносим извинения за неудобства.`
            )
          } catch (error) {
            console.error('Failed to send cancellation notification:', error)
          }
        }

        return { cancelledCount: bookingIds.length }

      case 'confirm':
        if (!driverId) {
          throw new Error('Driver ID is required for confirmation')
        }

        await prisma.booking.updateMany({
          where: {
            id: { in: bookingIds },
            status: BookingStatus.PENDING
          },
          data: {
            status: BookingStatus.CONFIRMED,
            driver_id: Number(driverId)
          }
        })

        return { confirmedCount: bookingIds.length }

      default:
        throw new Error('Invalid action')
    }
  }

  // Получить пользователей
  static async getUsers(params: {
    search?: string
    limit: number
    offset: number
  }) {
    const where: any = {}

    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { first_name: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm } },
        { telegram_id: { contains: searchTerm } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        bookings: {
          orderBy: { created_at: 'desc' },
          take: 3
        },
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: params.offset,
      take: params.limit
    })

    return users.map(user => ({
      id: user.id.toString(),
      telegramId: user.telegram_id,
      name: user.name || user.first_name,
      phone: user.phone,
      language: user.language_code,
      totalBookings: user._count.bookings,
      recentBookings: user.bookings.map(booking => ({
        id: booking.id,
        status: booking.status,
        fromLocation: booking.from_location,
        toLocation: booking.to_location,
        createdAt: booking.created_at
      })),
      createdAt: user.created_at.toISOString()
    }))
  }

  // Получить детали пользователя
  static async getUserDetails(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            vehicle: true,
            driver: true
          },
          orderBy: { created_at: 'desc' }
        }
      }
    })

    if (!user) return null

    return {
      id: user.id.toString(),
      telegramId: user.telegram_id,
      name: user.name || user.first_name,
      lastName: user.last_name,
      username: user.username,
      phone: user.phone,
      language: user.language_code,
      bookings: user.bookings.map(booking => this.formatBookingForAdmin(booking)),
      createdAt: user.created_at.toISOString(),
      updatedAt: user.updated_at.toISOString()
    }
  }

  // Форматирование заказа для админки
  private static formatBookingForAdmin(booking: any) {
    return {
      id: booking.id,
      status: booking.status,
      fromLocation: booking.from_location,
      toLocation: booking.to_location,
      price: Number(booking.price || booking.total_price || 0),
      pickupTime: booking.pickup_time,
      notes: booking.notes,
      vehicleType: booking.vehicle_type,
      user: {
        id: booking.user?.id?.toString(),
        name: booking.user?.name || booking.user?.first_name,
        phone: booking.user?.phone,
        photoUrl: booking.user?.photo_url,
        username: booking.user?.username,
        telegram_id: booking.user?.telegram_id
      },
      vehicle: booking.vehicle ? {
        id: booking.vehicle.id.toString(),
        brand: booking.vehicle.brand,
        model: booking.vehicle.model,
        licensePlate: booking.vehicle.license_plate,
        type: booking.vehicle.type
      } : null,
      driver: booking.driver ? {
        id: booking.driver.id.toString(),
        name: booking.driver.name,
        phone: booking.driver.phone,
        status: booking.driver.status
      } : null,
      createdAt: booking.created_at?.toISOString(),
      updatedAt: booking.updated_at?.toISOString()
    }
  }
}
