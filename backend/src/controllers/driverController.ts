import { Request, Response } from 'express'
import { prisma } from '@/utils/prisma'
import { DriverStatus, BookingStatus } from '@prisma/client'

export class DriverController {
  // GET /api/drivers/telegram/:telegramId - Получить водителя по Telegram ID
  static async getDriverByTelegramId(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId } = req.params
      console.log(`🔍 Поиск водителя по Telegram ID: ${telegramId}`)

      // Пока что просто возвращаем заглушку, так как у нас нет поля telegram_id для водителей
      // В реальной системе нужно добавить это поле в модель Driver

      res.status(404).json({
        success: false,
        error: 'Driver authentication not implemented yet'
      })
    } catch (error) {
      console.error('❌ Error finding driver by Telegram ID:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to find driver'
      })
    }
  }

  // GET /api/drivers/:id/trips - Получить рейсы водителя
  static async getDriverTrips(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const driverId = parseInt(id)

      console.log(`📋 Получение рейсов водителя ${driverId}`)

      if (isNaN(driverId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid driver ID'
        })
        return
      }

      // Проверяем, что водитель существует
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: { vehicle: true }
      })

      if (!driver) {
        res.status(404).json({
          success: false,
          error: 'Driver not found'
        })
        return
      }

      // Получаем активные и недавние рейсы водителя
      const trips = await prisma.booking.findMany({
        where: {
          driver_id: driverId,
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED]
          }
        },
        include: {
          user: true,
          vehicle: true,
          driver: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 20 // Ограничиваем количество
      })

      // Преобразуем данные для фронтенда
      const formattedTrips = trips.map(trip => ({
        id: trip.id,
        fromLocation: trip.from_location,
        toLocation: trip.to_location,
        pickupLocation: trip.pickup_location,
        dropoffLocation: trip.dropoff_location,
        pickupTime: trip.pickup_time,
        passengerCount: trip.passenger_count,
        price: Number(trip.price),
        status: trip.status,
        user: {
          name: trip.user.name || trip.user.first_name,
          phone: trip.user.phone,
          telegramId: trip.user.telegram_id
        },
        notes: trip.notes,
        distanceKm: trip.distance_km,
        createdAt: trip.created_at,
        updatedAt: trip.updated_at,
        vehicle: trip.vehicle ? {
          id: trip.vehicle.id,
          brand: trip.vehicle.brand,
          model: trip.vehicle.model,
          licensePlate: trip.vehicle.license_plate,
          type: trip.vehicle.type
        } : null
      }))

      console.log(`✅ Найдено ${formattedTrips.length} рейсов для водителя ${driverId}`)

      res.json({
        success: true,
        data: formattedTrips
      })
    } catch (error) {
      console.error('❌ Error fetching driver trips:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch driver trips'
      })
    }
  }

  // PUT /api/drivers/:id/status - Обновить статус водителя
  static async updateDriverStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status } = req.body
      const driverId = parseInt(id)

      console.log(`🔄 Обновление статуса водителя ${driverId} на ${status}`)

      if (isNaN(driverId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid driver ID'
        })
        return
      }

      if (!Object.values(DriverStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status'
        })
        return
      }

      const driver = await prisma.driver.update({
        where: { id: driverId },
        data: {
          status: status as DriverStatus,
          updated_at: new Date()
        },
        include: {
          vehicle: true
        }
      })

      console.log(`✅ Статус водителя ${driverId} обновлен на ${status}`)

      res.json({
        success: true,
        data: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          license: driver.license,
          status: driver.status,
          vehicle: driver.vehicle ? {
            id: driver.vehicle.id,
            brand: driver.vehicle.brand,
            model: driver.vehicle.model,
            licensePlate: driver.vehicle.license_plate,
            type: driver.vehicle.type
          } : null,
          updatedAt: driver.updated_at
        }
      })
    } catch (error) {
      console.error('❌ Error updating driver status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update driver status'
      })
    }
  }

  // GET /api/drivers/:id - Получить информацию о водителе
  static async getDriverById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const driverId = parseInt(id)

      console.log(`👤 Получение информации о водителе ${driverId}`)

      if (isNaN(driverId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid driver ID'
        })
        return
      }

      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: {
          vehicle: true,
          bookings: {
            where: {
              status: {
                in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
              }
            },
            include: {
              user: true
            },
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      })

      if (!driver) {
        res.status(404).json({
          success: false,
          error: 'Driver not found'
        })
        return
      }

      const formattedDriver = {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        license: driver.license,
        status: driver.status,
        vehicle: driver.vehicle ? {
          id: driver.vehicle.id,
          brand: driver.vehicle.brand,
          model: driver.vehicle.model,
          licensePlate: driver.vehicle.license_plate,
          type: driver.vehicle.type
        } : null,
        activeBookings: driver.bookings.map(booking => ({
          id: booking.id,
          fromLocation: booking.from_location,
          toLocation: booking.to_location,
          status: booking.status,
          pickupTime: booking.pickup_time,
          user: {
            name: booking.user.name || booking.user.first_name,
            phone: booking.user.phone
          },
          createdAt: booking.created_at
        })),
        createdAt: driver.created_at,
        updatedAt: driver.updated_at
      }

      console.log(`✅ Информация о водителе ${driverId} получена`)

      res.json({
        success: true,
        data: formattedDriver
      })
    } catch (error) {
      console.error('❌ Error fetching driver info:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch driver info'
      })
    }
  }
}
