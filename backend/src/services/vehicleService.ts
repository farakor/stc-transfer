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

  // Обновить статус автомобиля
  static async updateVehicleStatus(vehicleId: number, status: VehicleStatus) {
    return await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status }
    })
  }
}
