import { Request, Response } from 'express'
import { VehicleService } from '@/services/vehicleService'

export class VehicleController {
  // GET /api/vehicles - Получить список доступных автомобилей
  static async getAvailableVehicles(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query

      const vehicles = await VehicleService.getAvailableVehicles()

      // Преобразуем данные для фронтенда
      const vehicleData = vehicles.map(vehicle => ({
        id: vehicle.id,
        type: vehicle.type,
        name: vehicle.name,
        capacity: vehicle.capacity,
        pricePerKm: vehicle.price_per_km,
        imageUrl: vehicle.image_url,
        description: vehicle.description,
        features: vehicle.features || [],
        isAvailable: true,
        status: vehicle.status,
        licensePlate: vehicle.license_plate,
        brand: vehicle.brand,
        model: vehicle.model,
        driver: vehicle.driver ? {
          id: vehicle.driver.id,
          name: vehicle.driver.name,
          phone: vehicle.driver.phone,
          status: vehicle.driver.status
        } : null
      }))

      res.json({
        success: true,
        data: vehicleData,
        total: vehicleData.length
      })
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles'
      })
    }
  }

  // GET /api/vehicles/:id - Получить детали автомобиля
  static async getVehicleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const vehicle = await VehicleService.getVehicleById(parseInt(id))

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: vehicle.id,
          type: vehicle.type,
          name: vehicle.name,
          capacity: vehicle.capacity,
          pricePerKm: vehicle.price_per_km,
          imageUrl: vehicle.image_url,
          description: vehicle.description,
          features: vehicle.features || []
        }
      })
    } catch (error) {
      console.error('❌ Error fetching vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle details'
      })
    }
  }

  // GET /api/vehicles/all - Получить все автомобили для админ панели
  static async getAllVehicles(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await VehicleService.getAllVehicles()

      const vehicleData = vehicles.map(vehicle => ({
        id: vehicle.id,
        type: vehicle.type,
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        license_plate: vehicle.license_plate,
        capacity: vehicle.capacity,
        pricePerKm: Number(vehicle.price_per_km),
        status: vehicle.status,
        description: vehicle.description,
        features: vehicle.features || [],
        imageUrl: vehicle.image_url,
        wialonUnitId: vehicle.wialon_unit_id,
        driver: (vehicle as any).driver ? {
          id: (vehicle as any).driver.id,
          name: (vehicle as any).driver.name,
          phone: (vehicle as any).driver.phone
        } : null,
        createdAt: vehicle.created_at,
        updatedAt: vehicle.updated_at
      }))

      res.json({
        success: true,
        data: vehicleData,
        total: vehicleData.length
      })
    } catch (error) {
      console.error('❌ Error fetching all vehicles:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles'
      })
    }
  }

  // POST /api/vehicles - Создать новый автомобиль
  static async createVehicle(req: Request, res: Response): Promise<void> {
    try {
      const vehicleData = req.body
      console.log('📝 Создание автомобиля:', vehicleData)

      const vehicle = await VehicleService.createVehicle(vehicleData)

      res.status(201).json({
        success: true,
        data: {
          id: vehicle.id,
          type: vehicle.type,
          name: vehicle.name,
          brand: vehicle.brand,
          model: vehicle.model,
          license_plate: vehicle.license_plate,
          capacity: vehicle.capacity,
          pricePerKm: Number(vehicle.price_per_km),
          status: vehicle.status,
          description: vehicle.description,
          features: vehicle.features || [],
          imageUrl: vehicle.image_url,
          wialonUnitId: vehicle.wialon_unit_id,
          createdAt: vehicle.created_at,
          updatedAt: vehicle.updated_at
        }
      })
    } catch (error) {
      console.error('❌ Error creating vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create vehicle'
      })
    }
  }

  // PUT /api/vehicles/:id - Обновить автомобиль
  static async updateVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const vehicleData = req.body
      console.log(`📝 Обновление автомобиля ${id}:`, vehicleData)

      const vehicle = await VehicleService.updateVehicle(parseInt(id), vehicleData)

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: vehicle.id,
          type: vehicle.type,
          name: vehicle.name,
          brand: vehicle.brand,
          model: vehicle.model,
          license_plate: vehicle.license_plate,
          capacity: vehicle.capacity,
          pricePerKm: Number(vehicle.price_per_km),
          status: vehicle.status,
          description: vehicle.description,
          features: vehicle.features || [],
          imageUrl: vehicle.image_url,
          wialonUnitId: vehicle.wialon_unit_id,
          createdAt: vehicle.created_at,
          updatedAt: vehicle.updated_at
        }
      })
    } catch (error) {
      console.error('❌ Error updating vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update vehicle'
      })
    }
  }

  // DELETE /api/vehicles/:id - Удалить автомобиль
  static async deleteVehicle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      console.log(`🗑️ Удаление автомобиля ${id}`)

      const deleted = await VehicleService.deleteVehicle(parseInt(id))

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        })
        return
      }

      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      })
    } catch (error) {
      console.error('❌ Error deleting vehicle:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete vehicle'
      })
    }
  }

  // PUT /api/vehicles/:id/status - Обновить статус автомобиля
  static async updateVehicleStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status } = req.body
      console.log(`🔄 Обновление статуса автомобиля ${id} на ${status}`)

      const vehicle = await VehicleService.updateVehicleStatus(parseInt(id), status)

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        })
        return
      }

      res.json({
        success: true,
        data: {
          id: vehicle.id,
          status: vehicle.status
        }
      })
    } catch (error) {
      console.error('❌ Error updating vehicle status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update vehicle status'
      })
    }
  }

  // GET /api/vehicles/types - Получить типы автомобилей с описанием (группировка по названию)
  static async getVehicleTypes(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚗 Получение автомобилей по названиям...')

      // Получаем все автомобили из базы данных
      const vehicles = await VehicleService.getAvailableVehicles()
      console.log(`📦 Найдено ${vehicles.length} автомобилей в базе данных`)

      // Группируем по названиям и создаем уникальные варианты
      const vehicleNamesMap = new Map()

      vehicles.forEach(vehicle => {
        const nameKey = vehicle.name // Группируем по названию
        if (!vehicleNamesMap.has(nameKey)) {
          // Создаем вариант на основе первого автомобиля с этим названием
          vehicleNamesMap.set(nameKey, {
            type: vehicle.type,
            name: vehicle.name,
            description: vehicle.description || `${vehicle.name}`,
            capacity: vehicle.capacity,
            baggageCapacity: Math.floor(vehicle.capacity / 2), // Примерная вместимость багажа
            features: vehicle.features || [],
            imageUrl: vehicle.image_url,
            pricePerKm: Number(vehicle.price_per_km),
            basePrice: 20000, // Базовая цена
            // Добавляем информацию о количестве доступных машин
            availableCount: vehicles.filter(v => v.name === vehicle.name && v.status === 'AVAILABLE').length,
            totalCount: vehicles.filter(v => v.name === vehicle.name).length
          })
        }
      })

      const vehicleOptions = Array.from(vehicleNamesMap.values())
      console.log(`✅ Создано ${vehicleOptions.length} вариантов автомобилей по названиям`)

      res.json({
        success: true,
        data: vehicleOptions
      })
    } catch (error) {
      console.error('❌ Error fetching vehicle types:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle types'
      })
    }
  }

  // PUT /api/vehicles/:id/wialon - Связать автомобиль с Wialon unit
  static async linkWialonUnit(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { wialonUnitId } = req.body
      console.log(`🔗 Связывание автомобиля ${id} с Wialon unit ${wialonUnitId}`)

      const vehicle = await VehicleService.linkWialonUnit(parseInt(id), wialonUnitId)

      res.json({
        success: true,
        data: {
          id: vehicle.id,
          wialonUnitId: vehicle.wialon_unit_id
        }
      })
    } catch (error) {
      console.error('❌ Error linking Wialon unit:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to link Wialon unit'
      })
    }
  }

  // GET /api/vehicles/wialon/mapped - Получить все автомобили с привязкой к Wialon
  static async getVehiclesWithWialonMapping(req: Request, res: Response): Promise<void> {
    try {
      const vehicles = await VehicleService.getVehiclesWithWialonMapping()

      const vehicleData = vehicles.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        license_plate: vehicle.license_plate,
        wialonUnitId: vehicle.wialon_unit_id,
        driver: (vehicle as any).driver ? {
          id: (vehicle as any).driver.id,
          name: (vehicle as any).driver.name,
          phone: (vehicle as any).driver.phone
        } : null
      }))

      res.json({
        success: true,
        data: vehicleData
      })
    } catch (error) {
      console.error('❌ Error fetching vehicles with Wialon mapping:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles with Wialon mapping'
      })
    }
  }
}
