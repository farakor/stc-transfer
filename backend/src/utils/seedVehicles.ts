import { prisma } from './prisma'
import { VehicleType, VehicleStatus } from '@prisma/client'

const vehiclesData = [
  {
    type: VehicleType.SEDAN,
    name: 'Hongqi EHS5',
    brand: 'Hongqi',
    model: 'EHS5',
    license_plate: '01 A 123 BC',
    capacity: 3,
    price_per_km: 1500,
    description: 'Комфортный электромобиль для поездок до 3 пассажиров',
    features: ['Кондиционер', 'Wi-Fi', 'USB зарядка', 'Экологичный'],
    status: VehicleStatus.AVAILABLE
  },
  {
    type: VehicleType.PREMIUM,
    name: 'Hongqi EHS9',
    brand: 'Hongqi',
    model: 'EHS9',
    license_plate: '01 B 456 CD',
    capacity: 3,
    price_per_km: 3000,
    description: 'Премиум электромобиль класса люкс для VIP поездок',
    features: ['Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi', 'Экологичный'],
    status: VehicleStatus.AVAILABLE
  },
  {
    type: VehicleType.MINIVAN,
    name: 'Kia Carnival',
    brand: 'Kia',
    model: 'Carnival',
    license_plate: '01 C 789 EF',
    capacity: 5,
    price_per_km: 2000,
    description: 'Просторный минивэн для группы до 5 человек',
    features: ['Климат-контроль', 'USB зарядка', 'Просторный салон'],
    status: VehicleStatus.BUSY
  },
  {
    type: VehicleType.MICROBUS,
    name: 'Mercedes Sprinter',
    brand: 'Mercedes',
    model: 'Sprinter',
    license_plate: '01 D 111 GH',
    capacity: 16,
    price_per_km: 2500,
    description: 'Микроавтобус для больших групп до 16 человек',
    features: ['Кондиционер', 'Большой багажник', 'Удобные сиденья'],
    status: VehicleStatus.AVAILABLE
  },
  {
    type: VehicleType.BUS,
    name: 'Higer Bus',
    brand: 'Higer',
    model: 'Bus',
    license_plate: '01 E 222 IJ',
    capacity: 30,
    price_per_km: 3000,
    description: 'Комфортабельный автобус для больших групп до 30 человек',
    features: ['Кондиционер', 'Удобные сиденья', 'Большой багажник', 'Микрофон'],
    status: VehicleStatus.AVAILABLE
  },
  {
    type: VehicleType.SEDAN,
    name: 'Toyota Camry',
    brand: 'Toyota',
    model: 'Camry',
    license_plate: '01 F 333 KL',
    capacity: 3,
    price_per_km: 1800,
    description: 'Надежный седан для комфортных поездок',
    features: ['Кондиционер', 'USB зарядка', 'Надежность'],
    status: VehicleStatus.MAINTENANCE
  }
]

const driversData = [
  {
    name: 'Ибрагим Азизов',
    phone: '+998 90 123 45 67',
    license: 'AB1234567'
  },
  {
    name: 'Азиз Рахимов',
    phone: '+998 91 234 56 78',
    license: 'CD2345678'
  },
  {
    name: 'Саид Каримов',
    phone: '+998 93 345 67 89',
    license: 'EF3456789'
  },
  {
    name: 'Фарход Усманов',
    phone: '+998 94 456 78 90',
    license: 'GH4567890'
  }
]

export async function seedVehicles() {
  console.log('🚗 Заполнение базы данных автомобилями...')

  try {
    // Очищаем существующие данные
    await prisma.driver.deleteMany()
    await prisma.vehicle.deleteMany()

    // Создаем автомобили
    const createdVehicles = []
    for (const vehicleData of vehiclesData) {
      const vehicle = await prisma.vehicle.create({
        data: vehicleData
      })
      createdVehicles.push(vehicle)
      console.log(`✅ Создан автомобиль: ${vehicle.brand} ${vehicle.model} (${vehicle.license_plate})`)
    }

    // Создаем водителей
    const createdDrivers = []
    for (let i = 0; i < driversData.length; i++) {
      const driverData = driversData[i]
      const vehicle = createdVehicles[i] // Назначаем каждому водителю автомобиль

      const driver = await prisma.driver.create({
        data: {
          ...driverData,
          vehicle_id: vehicle?.id
        }
      })
      createdDrivers.push(driver)
      console.log(`✅ Создан водитель: ${driver.name} → ${vehicle?.brand} ${vehicle?.model}`)
    }

    console.log(`🎉 Успешно создано ${createdVehicles.length} автомобилей и ${createdDrivers.length} водителей`)

  } catch (error) {
    console.error('❌ Ошибка при заполнении данными:', error)
    throw error
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  seedVehicles()
    .then(() => {
      console.log('✅ Заполнение завершено')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Ошибка:', error)
      process.exit(1)
    })
}
