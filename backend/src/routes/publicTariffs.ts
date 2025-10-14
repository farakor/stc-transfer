import { Router } from 'express'
import { TariffController } from '../controllers/tariffController'

const router = Router()

// Публичные эндпоинты для тарифов (без авторизации)
// Эти маршруты используются клиентами для просмотра тарифов

// Получить матрицу тарифов для конструктора
router.get('/matrix', TariffController.getTariffMatrix)

// Получить модели автомобилей
router.get('/vehicle-models', TariffController.getVehicleModels)

// Получить локации
router.get('/locations', TariffController.getLocations)

// Получить маршруты
router.get('/routes', TariffController.getRoutes)

// Получить все тарифы
router.get('/', TariffController.getTariffs)

export default router

