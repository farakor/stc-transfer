import { Request, Response } from 'express'
import { BookingService } from '@/services/bookingService'

export class BookingController {
  // POST /api/bookings - Создать новый заказ
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const {
        telegramId,
        fromLocation,
        toLocation,
        vehicleType,
        pickupTime,
        notes,
        distanceKm
      } = req.body

      // Валидация обязательных полей
      if (!telegramId || !fromLocation || !toLocation || !vehicleType) {
        res.status(400).json({
          success: false,
          error: 'telegramId, fromLocation, toLocation, and vehicleType are required'
        })
        return
      }

      const validVehicleTypes = ['SEDAN', 'PREMIUM', 'MINIVAN', 'MICROBUS']
      if (!validVehicleTypes.includes(vehicleType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid vehicle type'
        })
        return
      }

      const booking = await BookingService.createBooking({
        telegramId: BigInt(telegramId),
        fromLocation,
        toLocation,
        vehicleType,
        pickupTime,
        notes,
        distanceKm: distanceKm ? Number(distanceKm) : undefined
      })

      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      })
    } catch (error) {
      console.error('❌ Error creating booking:', error)

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create booking'
        })
      }
    }
  }

  // GET /api/bookings/:id - Получить заказ по ID
  static async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const booking = await BookingService.getBookingById(id)

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found'
        })
        return
      }

      res.json({
        success: true,
        data: booking
      })
    } catch (error) {
      console.error('❌ Error fetching booking:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking'
      })
    }
  }

  // GET /api/bookings/user/:telegramId - Получить заказы пользователя
  static async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId } = req.params
      const { limit } = req.query

      const bookings = await BookingService.getUserBookings(
        BigInt(telegramId),
        limit ? Number(limit) : undefined
      )

      res.json({
        success: true,
        data: bookings,
        total: bookings.length
      })
    } catch (error) {
      console.error('❌ Error fetching user bookings:', error)

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch user bookings'
        })
      }
    }
  }

  // PUT /api/bookings/:id/status - Обновить статус заказа
  static async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status, notes } = req.body

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required'
        })
        return
      }

      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status'
        })
        return
      }

      const booking = await BookingService.updateBookingStatus(id, status, notes)

      res.json({
        success: true,
        data: booking,
        message: 'Booking status updated successfully'
      })
    } catch (error) {
      console.error('❌ Error updating booking status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update booking status'
      })
    }
  }

  // PUT /api/bookings/:id/assign-driver - Назначить водителя к заказу
  static async assignDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { driverId } = req.body

      if (!driverId) {
        res.status(400).json({
          success: false,
          error: 'Driver ID is required'
        })
        return
      }

      const booking = await BookingService.assignDriver(id, driverId)

      res.json({
        success: true,
        data: booking,
        message: 'Driver assigned successfully'
      })
    } catch (error) {
      console.error('❌ Error assigning driver:', error)

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        })
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to assign driver'
        })
      }
    }
  }

  // GET /api/bookings/active - Получить активные заказы (для диспетчера)
  static async getActiveBookings(req: Request, res: Response): Promise<void> {
    try {
      const bookings = await BookingService.getActiveBookings()

      res.json({
        success: true,
        data: bookings,
        total: bookings.length
      })
    } catch (error) {
      console.error('❌ Error fetching active bookings:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active bookings'
      })
    }
  }

  // GET /api/bookings/stats - Получить статистику заказов
  static async getBookingStats(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query

      const validPeriods = ['day', 'week', 'month']
      const selectedPeriod = period && validPeriods.includes(period as string)
        ? period as 'day' | 'week' | 'month'
        : undefined

      const stats = await BookingService.getBookingStats(selectedPeriod)

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('❌ Error fetching booking stats:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking statistics'
      })
    }
  }

  // PUT /api/bookings/:id/start - Начать рейс
  static async startTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { driverId, location } = req.body

      console.log(`🚀 Начало рейса ${id} водителем ${driverId}`)

      const booking = await BookingService.startTrip(id, driverId, location)

      res.json({
        success: true,
        data: booking
      })
    } catch (error) {
      console.error('❌ Error starting trip:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to start trip'
      })
    }
  }

  // PUT /api/bookings/:id/complete - Завершить рейс
  static async completeTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { driverId, location } = req.body

      console.log(`✅ Завершение рейса ${id} водителем ${driverId}`)

      const booking = await BookingService.completeTrip(id, driverId, location)

      res.json({
        success: true,
        data: booking
      })
    } catch (error) {
      console.error('❌ Error completing trip:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to complete trip'
      })
    }
  }
}
