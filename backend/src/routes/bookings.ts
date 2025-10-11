import { Router } from 'express'
import { BookingController } from '@/controllers/bookingController'

const router = Router()

// GET /api/bookings/active - Получить активные заказы (для диспетчера)
router.get('/active', BookingController.getActiveBookings)

// GET /api/bookings/all - Получить все заказы (включая завершенные и отмененные)
router.get('/all', BookingController.getAllBookings)

// GET /api/bookings/stats - Получить статистику заказов
router.get('/stats', BookingController.getBookingStats)

// GET /api/bookings/user/:telegramId - Получить заказы пользователя
router.get('/user/:telegramId', BookingController.getUserBookings)

// POST /api/bookings - Создать новый заказ
router.post('/', BookingController.createBooking)

// GET /api/bookings/:id - Получить информацию о заказе
router.get('/:id', BookingController.getBookingById)

// PUT /api/bookings/:id/status - Обновить статус заказа
router.put('/:id/status', BookingController.updateBookingStatus)

// PUT /api/bookings/:id/assign-vehicle - Назначить автомобиль к заказу
router.put('/:id/assign-vehicle', BookingController.assignVehicle)

// PUT /api/bookings/:id/assign-driver - Назначить водителя к заказу (для совместимости)
router.put('/:id/assign-driver', BookingController.assignDriver)

// PUT /api/bookings/:id/start - Начать рейс
router.put('/:id/start', BookingController.startTrip)

// PUT /api/bookings/:id/complete - Завершить рейс
router.put('/:id/complete', BookingController.completeTrip)

export default router
