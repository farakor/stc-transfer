import { Router } from 'express'
import { DriverController } from '@/controllers/driverController'

const router = Router()

// POST /api/drivers/login - Авторизация водителя по номеру телефона
router.post('/login', DriverController.loginByPhone)

// GET /api/drivers/telegram/:telegramId - Получить водителя по Telegram ID
router.get('/telegram/:telegramId', DriverController.getDriverByTelegramId)

// GET /api/drivers/:id - Получить информацию о водителе
router.get('/:id', DriverController.getDriverById)

// GET /api/drivers/:id/trips - Получить рейсы водителя
router.get('/:id/trips', DriverController.getDriverTrips)

// GET /api/drivers/:id/active-bookings - Получить активные заказы водителя
router.get('/:id/active-bookings', DriverController.getActiveBookings)

// PUT /api/drivers/:id/status - Обновить статус водителя
router.put('/:id/status', DriverController.updateDriverStatus)

// PUT /api/drivers/:driverId/bookings/:bookingId/accept - Принять заказ
router.put('/:driverId/bookings/:bookingId/accept', DriverController.acceptBooking)

// PUT /api/drivers/:driverId/bookings/:bookingId/start - Начать рейс
router.put('/:driverId/bookings/:bookingId/start', DriverController.startTrip)

// PUT /api/drivers/:driverId/bookings/:bookingId/complete - Завершить заказ
router.put('/:driverId/bookings/:bookingId/complete', DriverController.completeBooking)

export default router
