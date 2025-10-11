import { prisma } from '@/utils/prisma'
import { VehicleType, VehicleStatus } from '@prisma/client'

export class VehicleService {
  // Получить все доступные автомобили
  static async getAvailableVehicles() {
    return await prisma.vehicle.findMany({
      include: {
        driver: true
      },
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
    const vehicle = await prisma.vehicle.create({
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
        image_url: vehicleData.imageUrl,
        wialon_unit_id: vehicleData.wialonUnitId || null
      }
    })

    // Если указан водитель, назначаем его
    if (vehicleData.driverId) {
      await prisma.driver.update({
        where: { id: vehicleData.driverId },
        data: { vehicle_id: vehicle.id }
      })
    }

    return vehicle
  }

  // Обновить автомобиль
  static async updateVehicle(vehicleId: number, vehicleData: any) {
    try {
      // Получаем текущий автомобиль с водителем
      const currentVehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: { driver: true }
      })

      if (!currentVehicle) {
        return null
      }

      // Обновляем автомобиль
      const updatedVehicle = await prisma.vehicle.update({
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
          wialon_unit_id: vehicleData.wialonUnitId || null,
          updated_at: new Date()
        }
      })

      // Обрабатываем назначение водителя
      const newDriverId = vehicleData.driverId
      const currentDriverId = currentVehicle.driver?.id

      if (newDriverId !== currentDriverId) {
        // Если был старый водитель, отвязываем его
        if (currentDriverId) {
          await prisma.driver.update({
            where: { id: currentDriverId },
            data: { vehicle_id: null }
          })
        }

        // Если есть новый водитель, назначаем его
        if (newDriverId) {
          await prisma.driver.update({
            where: { id: newDriverId },
            data: { vehicle_id: vehicleId }
          })
        }
      }

      return updatedVehicle
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

  // Связать автомобиль с Wialon unit
  static async linkWialonUnit(vehicleId: number, wialonUnitId: string | null) {
    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        wialon_unit_id: wialonUnitId,
        updated_at: new Date()
      }
    })
  }

  // Получить автомобиль по Wialon unit ID
  static async getVehicleByWialonUnitId(wialonUnitId: string) {
    return await prisma.vehicle.findUnique({
      where: { wialon_unit_id: wialonUnitId },
      include: {
        driver: true
      }
    })
  }

  // Получить все автомобили с привязкой к Wialon
  static async getVehiclesWithWialonMapping() {
    return await prisma.vehicle.findMany({
      where: {
        wialon_unit_id: {
          not: null
        }
      },
      include: {
        driver: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  }
}
