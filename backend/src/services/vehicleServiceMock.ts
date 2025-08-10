import { VehicleType } from '@prisma/client'

// Временные данные для тестирования (согласно новому прайс-листу)
const MOCK_VEHICLES = [
  {
    id: 1,
    type: 'SEDAN' as VehicleType,
    name: 'Электромобиль Hongqi EHS 5',
    capacity: 3,
    price_per_km: '1500', // UZS per km
    status: 'AVAILABLE',
    brand: 'Hongqi',
    model: 'EHS 5',
    license_plate: 'EHS5001'
  },
  {
    id: 2,
    type: 'PREMIUM' as VehicleType,
    name: 'Электромобиль Hongqi EHS 9',
    capacity: 3,
    price_per_km: '3000', // UZS per km
    status: 'AVAILABLE',
    brand: 'Hongqi',
    model: 'EHS 9',
    license_plate: 'EHS9001'
  },
  {
    id: 3,
    type: 'MINIVAN' as VehicleType,
    name: 'Kia Carnival',
    capacity: 5,
    price_per_km: '2000', // UZS per km
    status: 'AVAILABLE',
    brand: 'KIA',
    model: 'Carnival',
    license_plate: 'CARN001'
  },
  {
    id: 4,
    type: 'MICROBUS' as VehicleType,
    name: 'Mercedes-Benz Sprinter',
    capacity: 16,
    price_per_km: '2500', // UZS per km
    status: 'AVAILABLE',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    license_plate: 'SPRT001'
  },
  {
    id: 5,
    type: 'BUS' as VehicleType,
    name: 'Автобус Higer',
    capacity: 30,
    price_per_km: '3000', // UZS per km
    status: 'AVAILABLE',
    brand: 'Higer',
    model: 'Bus',
    license_plate: 'HIGER001'
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
