import { Router } from 'express'
import { TariffController } from '../controllers/tariffController'

const router = Router()

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

// Создать или обновить тариф
router.post('/', TariffController.upsertTariff)

// Удалить тариф
router.delete('/:id', TariffController.deleteTariff)

// Создать новую локацию
router.post('/locations', TariffController.createLocation)

// Создать новый маршрут
router.post('/routes', TariffController.createRoute)

export default router
