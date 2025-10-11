import { Router } from 'express'
import { VehicleController } from '@/controllers/vehicleController'

const router = Router()

// GET /api/vehicles - Получить список доступных автомобилей
router.get('/', VehicleController.getAvailableVehicles)

// GET /api/vehicles/all - Получить все автомобили для админ панели
router.get('/all', VehicleController.getAllVehicles)

// GET /api/vehicles/types - Получить типы автомобилей с описанием
router.get('/types', VehicleController.getVehicleTypes)

// GET /api/vehicles/wialon/mapped - Получить все автомобили с привязкой к Wialon
router.get('/wialon/mapped', VehicleController.getVehiclesWithWialonMapping)

// POST /api/vehicles - Создать новый автомобиль
router.post('/', VehicleController.createVehicle)

// GET /api/vehicles/:id - Получить детали автомобиля
router.get('/:id', VehicleController.getVehicleById)

// PUT /api/vehicles/:id - Обновить автомобиль
router.put('/:id', VehicleController.updateVehicle)

// DELETE /api/vehicles/:id - Удалить автомобиль
router.delete('/:id', VehicleController.deleteVehicle)

// PUT /api/vehicles/:id/status - Обновить статус автомобиля
router.put('/:id/status', VehicleController.updateVehicleStatus)

// PUT /api/vehicles/:id/wialon - Связать автомобиль с Wialon unit
router.put('/:id/wialon', VehicleController.linkWialonUnit)

export default router
