import { Router } from 'express'
import { VehicleController } from '@/controllers/vehicleController'

const router = Router()

// GET /api/vehicles - Получить список доступных автомобилей
router.get('/', VehicleController.getAvailableVehicles)

// GET /api/vehicles/all - Получить все автомобили для админ панели
router.get('/all', VehicleController.getAllVehicles)

// GET /api/vehicles/types - Получить типы автомобилей с описанием
router.get('/types', VehicleController.getVehicleTypes)

// GET /api/vehicles/:id - Получить детали автомобиля
router.get('/:id', VehicleController.getVehicleById)

export default router
