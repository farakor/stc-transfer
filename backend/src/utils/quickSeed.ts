import { prisma } from './prisma'
import { VehicleType, VehicleStatus } from '@prisma/client'

async function quickSeed() {
  console.log('🌱 Quick seeding vehicles...')

  // Проверяем, есть ли уже данные
  const existingVehicles = await prisma.vehicle.count()
  if (existingVehicles > 0) {
    console.log(`✅ Found ${existingVehicles} existing vehicles, skipping seed`)
    return
  }

  // Создание автомобилей
  const vehicles = await Promise.all([
    // Седаны Hongqi EHS 5
    prisma.vehicle.create({
      data: {
        name: 'Hongqi EHS 5',
        type: VehicleType.SEDAN,
        capacity: 3,
        price_per_km: 1500,
        description: 'Комфортный седан для поездок до 3 пассажиров',
        features: ['Кондиционер', 'Wi-Fi', 'USB зарядка'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Hongqi',
        model: 'EHS 5',
        license_plate: 'SED001'
      }
    }),

    // Премиум Hongqi EHS 9
    prisma.vehicle.create({
      data: {
        name: 'Hongqi EHS 9',
        type: VehicleType.PREMIUM,
        capacity: 3,
        price_per_km: 3000,
        description: 'Премиум седан класса люкс для VIP поездок',
        features: ['Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Hongqi',
        model: 'EHS 9',
        license_plate: 'PREM001'
      }
    }),

    // Минивэн KIA Carnival
    prisma.vehicle.create({
      data: {
        name: 'KIA Carnival',
        type: VehicleType.MINIVAN,
        capacity: 5,
        price_per_km: 2000,
        description: 'Просторный минивэн для группы до 5 человек',
        features: ['Климат-контроль', 'USB зарядка', 'Просторный салон'],
        status: VehicleStatus.AVAILABLE,
        brand: 'KIA',
        model: 'Carnival',
        license_plate: 'MINI001'
      }
    }),

    // Микроавтобус Mercedes-Benz Sprinter
    prisma.vehicle.create({
      data: {
        name: 'Mercedes-Benz Sprinter',
        type: VehicleType.MICROBUS,
        capacity: 16,
        price_per_km: 2500,
        description: 'Микроавтобус для больших групп до 16 человек',
        features: ['Кондиционер', 'Большой багажник', 'Удобные сиденья'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Mercedes-Benz',
        model: 'Sprinter',
        license_plate: 'MICRO001'
      }
    })
  ])

  console.log(`🚗 Created ${vehicles.length} vehicles`)
  console.log('✅ Quick seed completed!')
}

quickSeed()
  .catch((e) => {
    console.error('❌ Error during quick seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

