import { prisma } from '@/utils/prisma'

export interface CreateUserData {
  telegramId: bigint
  name?: string
  phone?: string
  language?: string
}

export interface UpdateUserData {
  name?: string
  phone?: string
  language?: string
}

export class UserService {
  // Создать или обновить пользователя
  static async createOrUpdateUser(data: CreateUserData) {
    const existingUser = await prisma.user.findUnique({
      where: { telegram_id: String(data.telegramId) }
    })

    if (existingUser) {
      // Обновляем существующего пользователя
      return await prisma.user.update({
        where: { telegram_id: String(data.telegramId) },
        data: {
          name: data.name || existingUser.name,
          phone: data.phone || existingUser.phone,
          language_code: data.language || existingUser.language_code,
          updated_at: new Date()
        }
      })
    } else {
      // Создаем нового пользователя
      return await prisma.user.create({
        data: {
          telegram_id: String(data.telegramId),
          name: data.name,
          phone: data.phone,
          language_code: data.language || 'ru'
        }
      })
    }
  }

  // Получить пользователя по Telegram ID
  static async getUserByTelegramId(telegramId: bigint) {
    return await prisma.user.findUnique({
      where: { telegram_id: String(telegramId) },
      include: {
        bookings: {
          orderBy: {
            created_at: 'desc'
          },
          take: 10, // Последние 10 заказов
          include: {
            vehicle: true,
            driver: true,
            route: true
          }
        }
      }
    })
  }

  // Получить пользователя по ID
  static async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: {
            created_at: 'desc'
          },
          include: {
            vehicle: true,
            driver: true,
            route: true
          }
        }
      }
    })
  }

  // Обновить данные пользователя
  static async updateUser(telegramId: bigint, data: UpdateUserData) {
    return await prisma.user.update({
      where: { telegram_id: String(telegramId) },
      data: {
        name: data.name,
        phone: data.phone,
        language_code: data.language,
        updated_at: new Date()
      }
    })
  }

  // Получить статистику пользователя
  static async getUserStats(telegramId: bigint) {
    const user = await prisma.user.findUnique({
      where: { telegram_id: String(telegramId) },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!user) return null

    const bookingStats = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        user_id: user.id
      },
      _count: {
        status: true
      }
    })

    const totalSpent = await prisma.booking.aggregate({
      where: {
        user_id: user.id,
        status: 'COMPLETED'
      },
      _sum: {
        total_price: true
      }
    })

    return {
      user,
      totalBookings: user._count.bookings,
      bookingsByStatus: bookingStats,
      totalSpent: totalSpent._sum.total_price || 0
    }
  }

  // Получить всех пользователей (для админки)
  static async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          _count: {
            select: {
              bookings: true
            }
          }
        }
      }),
      prisma.user.count()
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}
