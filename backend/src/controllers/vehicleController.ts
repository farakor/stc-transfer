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
        isAvailable: true
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

  // GET /api/vehicles/types - Получить типы автомобилей с описанием
  static async getVehicleTypes(req: Request, res: Response): Promise<void> {
    try {
      // Пытаемся получить данные из базы
      let vehicleTypes: any[] = []

      try {
        const vehicles = await VehicleService.getAvailableVehicles()

        // Группируем по типам
        vehicleTypes = vehicles.reduce((acc, vehicle) => {
          const existingType = acc.find(v => v.type === vehicle.type)
          if (!existingType) {
            acc.push({
              type: vehicle.type,
              name: vehicle.name,
              description: vehicle.description,
              capacity: vehicle.capacity,
              features: vehicle.features || [],
              imageUrl: vehicle.image_url,
              pricePerKm: vehicle.price_per_km
            })
          }
          return acc
        }, [] as any[])
      } catch (dbError) {
        console.warn('⚠️ Database not available, using mock data:', dbError)

        // Возвращаем моковые данные если база недоступна
        vehicleTypes = [
          {
            type: 'SEDAN',
            name: 'Электромобиль Hongqi EHS 5',
            description: 'Комфортный электромобиль для поездок до 3 пассажиров',
            capacity: 3,
            baggageCapacity: 2,
            features: ['Кондиционер', 'Wi-Fi', 'USB зарядка', 'Экологичный'],
            imageUrl: null,
            pricePerKm: 1500,
            basePrice: 20000
          },
          {
            type: 'PREMIUM',
            name: 'Электромобиль Hongqi EHS 9',
            description: 'Премиум электромобиль класса люкс для VIP поездок',
            capacity: 3,
            baggageCapacity: 2,
            features: ['Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi', 'Экологичный'],
            imageUrl: null,
            pricePerKm: 3000,
            basePrice: 20000
          },
          {
            type: 'MINIVAN',
            name: 'Kia Carnival',
            description: 'Просторный минивэн для группы до 5 человек',
            capacity: 5,
            baggageCapacity: 4,
            features: ['Климат-контроль', 'USB зарядка', 'Просторный салон'],
            imageUrl: null,
            pricePerKm: 2000,
            basePrice: 20000
          },
          {
            type: 'MICROBUS',
            name: 'Mercedes-Benz Sprinter',
            description: 'Микроавтобус для больших групп до 16 человек',
            capacity: 16,
            baggageCapacity: 10,
            features: ['Кондиционер', 'Большой багажник', 'Удобные сиденья'],
            imageUrl: null,
            pricePerKm: 2500,
            basePrice: 20000
          },
          {
            type: 'BUS',
            name: 'Автобус Higer',
            description: 'Комфортабельный автобус для больших групп до 30 человек',
            capacity: 30,
            baggageCapacity: 15,
            features: ['Кондиционер', 'Удобные сиденья', 'Большой багажник', 'Микрофон'],
            imageUrl: null,
            pricePerKm: 3000,
            basePrice: 20000
          }
        ]
      }

      res.json({
        success: true,
        data: vehicleTypes
      })
    } catch (error) {
      console.error('❌ Error fetching vehicle types:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicle types'
      })
    }
  }
}
