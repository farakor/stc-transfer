import { Router } from 'express'
import { DriverController } from '@/controllers/driverController'

const router = Router()

// GET /api/drivers/telegram/:telegramId - Получить водителя по Telegram ID
router.get('/telegram/:telegramId', DriverController.getDriverByTelegramId)

// GET /api/drivers/:id - Получить информацию о водителе
router.get('/:id', DriverController.getDriverById)

// GET /api/drivers/:id/trips - Получить рейсы водителя
router.get('/:id/trips', DriverController.getDriverTrips)

// PUT /api/drivers/:id/status - Обновить статус водителя
router.put('/:id/status', DriverController.updateDriverStatus)

export default router
