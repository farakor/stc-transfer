import { Request, Response } from 'express'
import { prisma } from '@/utils/prisma'
import { DriverStatus, BookingStatus, VehicleStatus } from '@prisma/client'

export class DriverController {
  // POST /api/drivers/login - Авторизация водителя по номеру телефона
  static async loginByPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body
      console.log(`🔐 Попытка авторизации водителя по телефону: ${phone}`)

      if (!phone) {
        res.status(400).json({
          success: false,
          error: 'Phone number is required'
        })
        return
      }

      // Ищем водителя по номеру телефона
      // Нормализуем номер (только цифры) для корректного сравнения
      const cleanPhone = phone.replace(/\D/g, ''); // Только цифры
      
      console.log('🔍 Поиск водителя по номеру телефона:', {
        original: phone,
        clean: cleanPhone
      })

      // Сначала ищем всех водителей
      const allDrivers = await prisma.driver.findMany({
        select: {
          id: true,
          phone: true
        }
      })

      // Находим водителя, сравнивая только цифры в номерах
      const matchedDriver = allDrivers.find(d => {
        if (!d.phone) return false
        const dbPhoneClean = d.phone.replace(/\D/g, '')
        return dbPhoneClean === cleanPhone
      })

      if (!matchedDriver) {
        res.status(404).json({
          success: false,
          error: 'Driver not found with this phone number'
        })
        return
      }

      // Загружаем полные данные найденного водителя
      const driver = await prisma.driver.findUnique({
        where: { id: matchedDriver.id },
        include: {
          vehicle: true,
          bookings: {
            where: {
              status: {
                in: [BookingStatus.VEHICLE_ASSIGNED, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
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
          error: 'Driver not found with this phone number'
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
          bookingNumber: booking.booking_number,
          fromLocation: booking.from_location,
          toLocation: booking.to_location,
          pickupLocation: booking.pickup_location,
          dropoffLocation: booking.dropoff_location,
          pickupTime: booking.pickup_time,
          passengerCount: booking.passenger_count,
          price: Number(booking.price),
          status: booking.status,
          user: {
            name: booking.user.name || booking.user.first_name,
            phone: booking.user.phone,
            photoUrl: booking.user.photo_url,
            username: booking.user.username,
            telegramId: booking.user.telegram_id
          },
          notes: booking.notes,
          createdAt: booking.created_at
        })),
        createdAt: driver.created_at,
        updatedAt: driver.updated_at
      }

      console.log(`✅ Водитель ${driver.name} успешно авторизован`)

      res.json({
        success: true,
        data: formattedDriver
      })
    } catch (error) {
      console.error('❌ Error during driver login:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to login driver'
      })
    }
  }

  // GET /api/drivers/:id/active-bookings - Получить активные заказы водителя
  static async getActiveBookings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const driverId = parseInt(id)

      console.log(`📋 Получение активных заказов водителя ${driverId}`)

      if (isNaN(driverId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid driver ID'
        })
        return
      }

      const bookings = await prisma.booking.findMany({
        where: {
          driver_id: driverId,
          status: {
            in: [BookingStatus.VEHICLE_ASSIGNED, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
          }
        },
        include: {
          user: true,
          vehicle: true
        },
        orderBy: {
          created_at: 'desc'
        }
      })

      const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        bookingNumber: booking.booking_number,
        fromLocation: booking.from_location,
        toLocation: booking.to_location,
        pickupLocation: booking.pickup_location,
        dropoffLocation: booking.dropoff_location,
        pickupTime: booking.pickup_time,
        passengerCount: booking.passenger_count,
        price: Number(booking.price),
        status: booking.status,
        user: {
          name: booking.user.name || booking.user.first_name,
          phone: booking.user.phone,
          photoUrl: booking.user.photo_url,
          username: booking.user.username,
          telegramId: booking.user.telegram_id
        },
        notes: booking.notes,
        distanceKm: booking.distance_km,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }))

      console.log(`✅ Найдено ${formattedBookings.length} активных заказов для водителя ${driverId}`)

      res.json({
        success: true,
        data: formattedBookings
      })
    } catch (error) {
      console.error('❌ Error fetching active bookings:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active bookings'
      })
    }
  }

  // PUT /api/drivers/:driverId/bookings/:bookingId/accept - Принять заказ
  static async acceptBooking(req: Request, res: Response): Promise<void> {
    try {
      const { driverId, bookingId } = req.params
      const driverIdNum = parseInt(driverId)

      console.log(`✅ Водитель ${driverId} принимает заказ ${bookingId}`)

      if (isNaN(driverIdNum)) {
        res.status(400).json({
          success: false,
          error: 'Invalid driver ID'
        })
        return
      }

      // Проверяем, что заказ существует и назначен этому водителю
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          driver_id: driverIdNum,
          status: BookingStatus.VEHICLE_ASSIGNED
        },
        include: {
          user: true,
          driver: true,
          vehicle: true
        }
      })

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found or not assigned to this driver'
        })
        return
      }

      // Обновляем статус заказа на CONFIRMED (В пути)
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          updated_at: new Date()
        },
        include: {
          user: true,
          driver: true,
          vehicle: true
        }
      })

      // Обновляем статус водителя на BUSY
      await prisma.driver.update({
        where: { id: driverIdNum },
        data: {
          status: DriverStatus.BUSY,
          updated_at: new Date()
        }
      })

      console.log(`✅ Заказ ${bookingId} принят водителем ${driverId}, статус изменен на CONFIRMED`)

      // Отправить уведомление клиенту о том, что водитель принял заказ
      try {
        if (updatedBooking.user.telegram_id) {
          const { TelegramBotService } = await import('@/services/telegramBot')
          const telegramBot = TelegramBotService.getInstance()
          await telegramBot.sendDriverAcceptedNotification(
            Number(updatedBooking.user.telegram_id),
            updatedBooking,
            updatedBooking.driver
          )
          console.log(`📱 Уведомление о принятии заказа отправлено клиенту ${updatedBooking.user.telegram_id}`)
        }
      } catch (error) {
        console.error('❌ Failed to send driver accepted notification to client:', error)
      }

      res.json({
        success: true,
        data: {
          id: updatedBooking.id,
          status: updatedBooking.status,
          message: 'Заказ принят. Вы в пути к клиенту.'
        }
      })
    } catch (error) {
      console.error('❌ Error accepting booking:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to accept booking'
      })
    }
  }

  // PUT /api/drivers/:driverId/bookings/:bookingId/start - Начать рейс
  static async startTrip(req: Request, res: Response): Promise<void> {
    try {
      const { driverId, bookingId } = req.params
      const driverIdNum = parseInt(driverId)

      console.log(`🚗 Водитель ${driverId} начинает рейс ${bookingId}`)

      if (isNaN(driverIdNum)) {
        res.status(400).json({
          success: false,
          error: 'Invalid driver ID'
        })
        return
      }

      // Проверяем, что заказ существует и в статусе CONFIRMED
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          driver_id: driverIdNum,
          status: BookingStatus.CONFIRMED
        }
      })

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found or not in correct status'
        })
        return
      }

      // Обновляем статус заказа на IN_PROGRESS (В работе)
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

      // Обновляем статус автомобиля на BUSY
      if (updatedBooking.vehicle_id) {
        await prisma.vehicle.update({
          where: { id: updatedBooking.vehicle_id },
          data: { 
            status: VehicleStatus.BUSY,
            updated_at: new Date()
          }
        })
        console.log(`✅ Статус автомобиля ${updatedBooking.vehicle_id} обновлен на BUSY`)
      }

      console.log(`✅ Рейс ${bookingId} начат, статус изменен на IN_PROGRESS`)

      // Отправить уведомление клиенту о том, что рейс начался
      try {
        if (updatedBooking.user.telegram_id) {
          const { TelegramBotService } = await import('@/services/telegramBot')
          const telegramBot = TelegramBotService.getInstance()
          await telegramBot.sendTripStartedNotification(
            Number(updatedBooking.user.telegram_id),
            updatedBooking,
            updatedBooking.driver
          )
          console.log(`📱 Уведомление о начале рейса отправлено клиенту ${updatedBooking.user.telegram_id}`)
        }
      } catch (error) {
        console.error('❌ Failed to send trip started notification to client:', error)
      }

      res.json({
        success: true,
        data: {
          id: updatedBooking.id,
          status: updatedBooking.status,
          message: 'Рейс начат. Клиент в машине.'
        }
      })
    } catch (error) {
      console.error('❌ Error starting trip:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to start trip'
      })
    }
  }

  // PUT /api/drivers/:driverId/bookings/:bookingId/complete - Завершить заказ
  static async completeBooking(req: Request, res: Response): Promise<void> {
    try {
      const { driverId, bookingId } = req.params
      const driverIdNum = parseInt(driverId)

      console.log(`🏁 Водитель ${driverId} завершает заказ ${bookingId}`)

      if (isNaN(driverIdNum)) {
        res.status(400).json({
          success: false,
          error: 'Invalid driver ID'
        })
        return
      }

      // Проверяем, что заказ существует и в статусе IN_PROGRESS
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          driver_id: driverIdNum,
          status: BookingStatus.IN_PROGRESS
        }
      })

      if (!booking) {
        res.status(404).json({
          success: false,
          error: 'Booking not found or not in progress'
        })
        return
      }

      // Обновляем статус заказа на COMPLETED (Завершен)
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

      // Обновляем статус автомобиля на AVAILABLE
      if (updatedBooking.vehicle_id) {
        await prisma.vehicle.update({
          where: { id: updatedBooking.vehicle_id },
          data: { 
            status: VehicleStatus.AVAILABLE,
            updated_at: new Date()
          }
        })
        console.log(`✅ Статус автомобиля ${updatedBooking.vehicle_id} обновлен на AVAILABLE`)
      }

      // Проверяем, есть ли у водителя другие активные заказы
      const activeBookings = await prisma.booking.findMany({
        where: {
          driver_id: driverIdNum,
          status: {
            in: [BookingStatus.VEHICLE_ASSIGNED, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
          }
        }
      })

      // Если нет активных заказов, меняем статус водителя на AVAILABLE
      if (activeBookings.length === 0) {
        await prisma.driver.update({
          where: { id: driverIdNum },
          data: {
            status: DriverStatus.AVAILABLE,
            updated_at: new Date()
          }
        })
      }

      console.log(`✅ Заказ ${bookingId} завершен, статус изменен на COMPLETED`)

      // Отправить уведомление клиенту о том, что поездка завершена
      try {
        if (updatedBooking.user.telegram_id) {
          const { TelegramBotService } = await import('@/services/telegramBot')
          const telegramBot = TelegramBotService.getInstance()
          await telegramBot.sendTripCompletedNotification(
            Number(updatedBooking.user.telegram_id),
            updatedBooking
          )
          console.log(`📱 Уведомление о завершении поездки отправлено клиенту ${updatedBooking.user.telegram_id}`)
        }
      } catch (error) {
        console.error('❌ Failed to send trip completed notification to client:', error)
      }

      res.json({
        success: true,
        data: {
          id: updatedBooking.id,
          status: updatedBooking.status,
          message: 'Заказ успешно завершен.'
        }
      })
    } catch (error) {
      console.error('❌ Error completing booking:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to complete booking'
      })
    }
  }
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
