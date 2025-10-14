import { Request, Response } from 'express'
import { AdminService } from '@/services/adminService'
import { TelegramBotService } from '@/services/telegramBot'

export class AdminController {
  // GET /api/admin/bookings - Получить все заказы с фильтрацией
  static async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        dateFrom,
        dateTo,
        driverId,
        search,
        page = 1,
        limit = 20
      } = req.query

      const filter = {
        status: status as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        driverId: driverId as string,
        search: search as string
      }

      const pagination = {
        page: Number(page),
        limit: Number(limit)
      }

      const result = await AdminService.getAllBookings(filter, pagination)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings'
      })
    }
  }

  // GET /api/admin/drivers - Получить всех водителей
  static async getAllDrivers(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await AdminService.getAllDrivers()

      res.json({
        success: true,
        data: drivers
      })
    } catch (error) {
      console.error('❌ Error fetching drivers:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch drivers'
      })
    }
  }

  // GET /api/admin/drivers/available - Получить доступных водителей
  static async getAvailableDrivers(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await AdminService.getAvailableDrivers()

      res.json({
        success: true,
        data: drivers
      })
    } catch (error) {
      console.error('❌ Error fetching available drivers:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch available drivers'
      })
    }
  }

  // POST /api/admin/drivers - Создать водителя
  static async createDriver(req: Request, res: Response): Promise<void> {
    try {
      const { name, phone, license, vehicleId } = req.body

      if (!name || !phone || !license) {
        res.status(400).json({
          success: false,
          error: 'Name, phone, and license are required'
        })
        return
      }

      const driver = await AdminService.createDriver({
        name,
        phone,
        license,
        vehicleId: vehicleId ? Number(vehicleId) : undefined
      })

      res.status(201).json({
        success: true,
        data: driver,
        message: 'Driver created successfully'
      })
    } catch (error) {
      console.error('❌ Error creating driver:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create driver'
      })
    }
  }

  // PUT /api/admin/drivers/:id - Обновить водителя
  static async updateDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { name, phone, license, status, vehicleId } = req.body

      const updateData = {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(license && { license }),
        ...(status && { status }),
        ...(vehicleId && { vehicleId: vehicleId.toString() })
      }

      const driver = await AdminService.updateDriver(Number(id), updateData)

      res.json({
        success: true,
        data: driver,
        message: 'Driver updated successfully'
      })
    } catch (error) {
      console.error('❌ Error updating driver:', error)

      if (error instanceof Error && error.message === 'Driver not found') {
        res.status(404).json({
          success: false,
          error: 'Driver not found'
        })
        return
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update driver'
      })
    }
  }

  // DELETE /api/admin/drivers/:id - Удалить водителя
  static async deleteDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await AdminService.deleteDriver(Number(id))

      res.json({
        success: true,
        message: 'Driver deleted successfully'
      })
    } catch (error) {
      console.error('❌ Error deleting driver:', error)

      if (error instanceof Error && error.message === 'Driver not found') {
        res.status(404).json({
          success: false,
          error: 'Driver not found'
        })
        return
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete driver'
      })
    }
  }

  // GET /api/admin/vehicles - Получить все автомобили
  static async getAllVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await AdminService.getAllVehicles()

      res.json({
        success: true,
        data: vehicles
      })
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles'
      })
    }
  }

  // POST /api/admin/vehicles - Создать автомобиль
  static async createVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicleData = req.body

      const vehicle = await AdminService.createVehicle(vehicleData)

      res.status(201).json({
        success: true,
        data: vehicle,
        message: 'Vehicle created successfully'
      })
    } catch (error) {
      console.error('❌ Error creating vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create vehicle'
      })
    }
  }

  // PUT /api/admin/vehicles/:id - Обновить автомобиль
  static async updateVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData = req.body

      const vehicle = await AdminService.updateVehicle(Number(id), updateData)

      res.json({
        success: true,
        data: vehicle,
        message: 'Vehicle updated successfully'
      })
    } catch (error) {
      console.error('❌ Error updating vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update vehicle'
      })
    }
  }

  // DELETE /api/admin/vehicles/:id - Удалить автомобиль
  static async deleteVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await AdminService.deleteVehicle(Number(id))

      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      })
    } catch (error) {
      console.error('❌ Error deleting vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete vehicle'
      })
    }
  }

  // POST /api/admin/telegram/notify - Отправить Telegram уведомление
  static async sendTelegramNotification(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, message, type } = req.body

      if (!chatId || !message) {
        res.status(400).json({
          success: false,
          error: 'ChatId and message are required'
        })
        return
      }

      const telegramBot = TelegramBotService.getInstance()
      await telegramBot.sendNotification(Number(chatId), message)

      res.json({
        success: true,
        message: 'Notification sent successfully'
      })
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to send notification'
      })
    }
  }

  // POST /api/admin/telegram/test - Тестировать Telegram бота
  static async testTelegramBot(req: Request, res: Response): Promise<void> {
    try {
      const dispatcherChatId = process.env.DISPATCHER_CHAT_ID

      if (!dispatcherChatId) {
        res.status(400).json({
          success: false,
          error: 'DISPATCHER_CHAT_ID not configured'
        })
        return
      }

      const telegramBot = TelegramBotService.getInstance()
      await telegramBot.sendNotification(
        Number(dispatcherChatId),
        '🔧 Тест соединения с Telegram ботом\n\nЕсли вы видите это сообщение, интеграция работает корректно!'
      )

      res.json({
        success: true,
        message: 'Test notification sent successfully'
      })
    } catch (error) {
      console.error('❌ Error testing Telegram bot:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to test Telegram bot'
      })
    }
  }

  // GET /api/admin/analytics/revenue - Аналитика выручки
  static async getRevenueAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month' } = req.query

      const analytics = await AdminService.getRevenueAnalytics(period as string)

      res.json({
        success: true,
        data: analytics
      })
    } catch (error) {
      console.error('❌ Error fetching revenue analytics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch revenue analytics'
      })
    }
  }

  // GET /api/admin/analytics/popular-routes - Популярные маршруты
  static async getPopularRoutes(req: Request, res: Response): Promise<void> {
    try {
      const routes = await AdminService.getPopularRoutes()

      res.json({
        success: true,
        data: routes
      })
    } catch (error) {
      console.error('❌ Error fetching popular routes:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular routes'
      })
    }
  }

  // GET /api/admin/analytics/driver-performance - Производительность водителей
  static async getDriverPerformance(req: Request, res: Response): Promise<void> {
    try {
      const performance = await AdminService.getDriverPerformance()

      res.json({
        success: true,
        data: performance
      })
    } catch (error) {
      console.error('❌ Error fetching driver performance:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch driver performance'
      })
    }
  }

  // GET /api/admin/analytics/realtime - Метрики в реальном времени
  static async getRealTimeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await AdminService.getRealTimeMetrics()

      res.json({
        success: true,
        data: metrics
      })
    } catch (error) {
      console.error('❌ Error fetching realtime metrics:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch realtime metrics'
      })
    }
  }

  // GET /api/admin/analytics/orders-status - Статистика по статусам заказов
  static async getOrdersStatusData(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query
      
      const validPeriods = ['day', 'week', 'month']
      const selectedPeriod = period && validPeriods.includes(period as string)
        ? period as 'day' | 'week' | 'month'
        : undefined

      const statusData = await AdminService.getOrdersStatusData(selectedPeriod)

      res.json({
        success: true,
        data: statusData
      })
    } catch (error) {
      console.error('❌ Error fetching orders status data:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders status data'
      })
    }
  }

  // POST /api/admin/bookings/bulk-update - Массовые операции с заказами
  static async bulkUpdateBookings(req: Request, res: Response): Promise<void> {
    try {
      const { bookingIds, action, driverId } = req.body

      if (!bookingIds || !Array.isArray(bookingIds) || !action) {
        res.status(400).json({
          success: false,
          error: 'BookingIds array and action are required'
        })
        return
      }

      const result = await AdminService.bulkUpdateBookings(bookingIds, action, driverId)

      res.json({
        success: true,
        data: result,
        message: `Bulk ${action} completed successfully`
      })
    } catch (error) {
      console.error('❌ Error performing bulk update:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to perform bulk update'
      })
    }
  }

  // GET /api/admin/users - Получить пользователей
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { search, limit = 50, offset = 0 } = req.query

      const params = {
        search: search as string,
        limit: Number(limit),
        offset: Number(offset)
      }

      const users = await AdminService.getUsers(params)

      res.json({
        success: true,
        data: users
      })
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      })
    }
  }

  // GET /api/admin/users/:id - Получить детали пользователя
  static async getUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const user = await AdminService.getUserDetails(Number(id))

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        })
        return
      }

      res.json({
        success: true,
        data: user
      })
    } catch (error) {
      console.error('❌ Error fetching user details:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user details'
      })
    }
  }
}
