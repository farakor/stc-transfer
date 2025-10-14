import { Router } from 'express'
import { TrackingController } from '@/controllers/trackingController'

const router = Router()

/**
 * Публичные роуты для отслеживания транспорта
 * Доступны всем пользователям без авторизации
 */

// GET /api/tracking/vehicles/:unitId/position - Получить позицию транспорта
router.get('/vehicles/:unitId/position', TrackingController.getVehiclePosition)

export default router

