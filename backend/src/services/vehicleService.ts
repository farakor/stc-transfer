import { prisma } from '@/utils/prisma'
import { VehicleType, VehicleStatus } from '@prisma/client'

export class VehicleService {
  // Получить все доступные автомобили
  static async getAvailableVehicles() {
    return await prisma.vehicle.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }

  // Получить все автомобили (для админ панели)
  static async getAllVehicles() {
    return await prisma.vehicle.findMany({
      include: {
        driver: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
  }

  // Получить автомобили по типу
  static async getVehiclesByType(type: VehicleType) {
    return await prisma.vehicle.findMany({
      where: {
        type: type
      }
    })
  }

  // Получить автомобиль по ID
  static async getVehicleById(id: number) {
    return await prisma.vehicle.findUnique({
      where: { id }
    })
  }

  // Найти подходящий автомобиль для заказа
  static async findSuitableVehicle(vehicleType: VehicleType, capacity?: number) {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        type: vehicleType,
        status: VehicleStatus.AVAILABLE,
        ...(capacity && { capacity: { gte: capacity } })
      },
      include: {
        driver: true
      },
      orderBy: {
        id: 'asc' // Приоритет по ID
      },
      take: 1
    })

    return vehicles[0] || null
  }

  // Создать новый автомобиль
  static async createVehicle(vehicleData: any) {
    return await prisma.vehicle.create({
      data: {
        type: vehicleData.type,
        name: vehicleData.name,
        brand: vehicleData.brand,
        model: vehicleData.model,
        license_plate: vehicleData.license_plate,
        capacity: vehicleData.capacity,
        price_per_km: vehicleData.pricePerKm,
        status: vehicleData.status || VehicleStatus.AVAILABLE,
        description: vehicleData.description,
        features: vehicleData.features || [],
        image_url: vehicleData.imageUrl
      }
    })
  }

  // Обновить автомобиль
  static async updateVehicle(vehicleId: number, vehicleData: any) {
    try {
      return await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          type: vehicleData.type,
          name: vehicleData.name,
          brand: vehicleData.brand,
          model: vehicleData.model,
          license_plate: vehicleData.license_plate,
          capacity: vehicleData.capacity,
          price_per_km: vehicleData.pricePerKm,
          status: vehicleData.status,
          description: vehicleData.description,
          features: vehicleData.features || [],
          image_url: vehicleData.imageUrl,
          updated_at: new Date()
        }
      })
    } catch (error) {
      console.error('Error updating vehicle:', error)
      return null
    }
  }

  // Удалить автомобиль
  static async deleteVehicle(vehicleId: number) {
    try {
      // Проверяем, есть ли привязанный водитель
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { driver: true }
      })

      if (!vehicle) {
        return false
      }

      // Если есть водитель, отвязываем его
      if (vehicle.driver) {
        await prisma.driver.update({
          where: { id: vehicle.driver.id },
          data: { vehicle_id: null }
        })
      }

      // Удаляем автомобиль
      await prisma.vehicle.delete({
        where: { id: vehicleId }
      })

      return true
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      return false
    }
  }

  // Обновить статус автомобиля
  static async updateVehicleStatus(vehicleId: number, status: VehicleStatus) {
    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status,
        updated_at: new Date()
      }
    })
  }
}
