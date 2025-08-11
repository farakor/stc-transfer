import { Router } from 'express'
import { AdminController } from '@/controllers/adminController'

const router = Router()

// Заказы
router.get('/bookings', AdminController.getAllBookings)
router.post('/bookings/bulk-update', AdminController.bulkUpdateBookings)

// Водители
router.get('/drivers', AdminController.getAllDrivers)
router.get('/drivers/available', AdminController.getAvailableDrivers)
router.post('/drivers', AdminController.createDriver)
router.put('/drivers/:id', AdminController.updateDriver)
router.delete('/drivers/:id', AdminController.deleteDriver)

// Автомобили
router.get('/vehicles', AdminController.getAllVehicles)
router.post('/vehicles', AdminController.createVehicle)
router.put('/vehicles/:id', AdminController.updateVehicle)
router.delete('/vehicles/:id', AdminController.deleteVehicle)

// Пользователи
router.get('/users', AdminController.getUsers)
router.get('/users/:id', AdminController.getUserDetails)

// Telegram уведомления
router.post('/telegram/notify', AdminController.sendTelegramNotification)
router.post('/telegram/test', AdminController.testTelegramBot)

// Аналитика
router.get('/analytics/revenue', AdminController.getRevenueAnalytics)
router.get('/analytics/popular-routes', AdminController.getPopularRoutes)
router.get('/analytics/driver-performance', AdminController.getDriverPerformance)

export default router
