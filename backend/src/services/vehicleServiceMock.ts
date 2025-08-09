import { VehicleType } from '@prisma/client'

// Временные данные для тестирования
const MOCK_VEHICLES = [
  {
    id: 1,
    type: 'SEDAN' as VehicleType,
    name: 'Sedan',
    capacity: 4,
    price_per_km: '5000', // UZS per km
    status: 'AVAILABLE',
    brand: 'Chevrolet',
    model: 'Lacetti',
    license_plate: '01A123BC'
  },
  {
    id: 2,
    type: 'PREMIUM' as VehicleType,
    name: 'Premium',
    capacity: 4,
    price_per_km: '8000', // UZS per km
    status: 'AVAILABLE',
    brand: 'Mercedes',
    model: 'E-Class',
    license_plate: '01A456DE'
  },
  {
    id: 3,
    type: 'MINIVAN' as VehicleType,
    name: 'Minivan',
    capacity: 7,
    price_per_km: '6000', // UZS per km
    status: 'AVAILABLE',
    brand: 'Toyota',
    model: 'Alphard',
    license_plate: '01A789FG'
  },
  {
    id: 4,
    type: 'MICROBUS' as VehicleType,
    name: 'Microbus',
    capacity: 12,
    price_per_km: '7000', // UZS per km
    status: 'AVAILABLE',
    brand: 'Mercedes',
    model: 'Sprinter',
    license_plate: '01A012HI'
  }
]

export class VehicleServiceMock {
  // Получить автомобили по типу
  static async getVehiclesByType(type: VehicleType) {
    return MOCK_VEHICLES.filter(vehicle => vehicle.type === type)
  }

  // Найти подходящий автомобиль для заказа
  static async findSuitableVehicle(vehicleType: VehicleType, capacity?: number) {
    const vehicles = MOCK_VEHICLES.filter(vehicle =>
      vehicle.type === vehicleType &&
      vehicle.status === 'AVAILABLE' &&
      (!capacity || vehicle.capacity >= capacity)
    )

    const vehicle = vehicles[0]
    if (vehicle) {
      // Добавляем поле driver к моковому автомобилю
      return {
        ...vehicle,
        driver: null // Можно добавить моковых водителей позже
      }
    }
    return null
  }
}
