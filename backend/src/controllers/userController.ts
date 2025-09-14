import { Request, Response } from 'express'
import { UserService } from '@/services/userService'
import { AdminService } from '@/services/adminService'

export class UserController {
  // POST /api/users - Создать или обновить пользователя
  static async createOrUpdateUser(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId, name, phone, language } = req.body

      if (!telegramId) {
        res.status(400).json({
          success: false,
          error: 'Telegram ID is required'
        })
        return
      }

      const user = await UserService.createOrUpdateUser({
        telegramId: BigInt(telegramId),
        name,
        phone,
        language
      })

      res.json({
        success: true,
        data: {
          id: user.id,
          telegramId: user.telegram_id,
          name: user.name,
          phone: user.phone,
          language: user.language_code,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      })
    } catch (error) {
      console.error('❌ Error creating/updating user:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create or update user'
      })
    }
  }

  // GET /api/users/telegram/:telegramId - Получить пользователя по Telegram ID
  static async getUserByTelegramId(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId } = req.params

      const user = await UserService.getUserByTelegramId(BigInt(telegramId))

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          telegramId: user.telegram_id,
          name: user.name,
          phone: user.phone,
          language: user.language_code,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          bookings: user.bookings.map(booking => ({
            id: booking.id,
            fromLocation: booking.from_location,
            toLocation: booking.to_location,
            status: booking.status,
            price: booking.price,
            createdAt: booking.created_at,
            vehicle: booking.vehicle ? {
              brand: booking.vehicle.brand || booking.vehicle.name,
              model: booking.vehicle.model || ''
            } : null
          }))
        }
      })
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      })
    }
  }

  // PUT /api/users/telegram/:telegramId - Обновить данные пользователя
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId } = req.params
      const { name, phone, language } = req.body

      const user = await UserService.updateUser(BigInt(telegramId), {
        name,
        phone,
        language
      })

      res.json({
        success: true,
        data: {
          id: user.id,
          telegramId: user.telegram_id,
          name: user.name,
          phone: user.phone,
          language: user.language_code,
          updatedAt: user.updated_at
        }
      })
    } catch (error) {
      console.error('❌ Error updating user:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update user'
      })
    }
  }

  // GET /api/users/telegram/:telegramId/stats - Получить статистику пользователя
  static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId } = req.params

      const stats = await UserService.getUserStats(BigInt(telegramId))

      if (!stats) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          user: {
            id: stats.user.id,
            name: stats.user.name,
            phone: stats.user.phone,
            language: stats.user.language_code
          },
          stats: {
            totalBookings: stats.totalBookings,
            bookingsByStatus: stats.bookingsByStatus,
            totalSpent: Number(stats.totalSpent)
          }
        }
      })
    } catch (error) {
      console.error('❌ Error fetching user stats:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics'
      })
    }
  }

  // GET /api/users?role=driver - Получить всех водителей
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.query

      if (role === 'driver') {
        // Получаем всех водителей
        const drivers = await AdminService.getAllDrivers()

        res.json({
          success: true,
          data: drivers
        })
      } else {
        // Получаем обычных пользователей
        const { page = 1, limit = 20 } = req.query
        const result = await UserService.getAllUsers(Number(page), Number(limit))

        res.json({
          success: true,
          data: result.users,
          pagination: result.pagination
        })
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      })
    }
  }
}
