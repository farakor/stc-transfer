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

  // Создание автомобилей (согласно новому прайс-листу)
  const vehicles = await Promise.all([
    // Электромобиль Hongqi EHS 5 (SEDAN)
    prisma.vehicle.create({
      data: {
        name: 'Электромобиль Hongqi EHS 5',
        type: VehicleType.SEDAN,
        capacity: 3,
        price_per_km: 1500,
        description: 'Комфортный электромобиль для поездок до 3 пассажиров',
        features: ['Кондиционер', 'Wi-Fi', 'USB зарядка', 'Экологичный'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Hongqi',
        model: 'EHS 5',
        license_plate: 'EHS5001'
      }
    }),

    // Электромобиль Hongqi EHS 9 (PREMIUM)
    prisma.vehicle.create({
      data: {
        name: 'Электромобиль Hongqi EHS 9',
        type: VehicleType.PREMIUM,
        capacity: 3,
        price_per_km: 3000,
        description: 'Премиум электромобиль класса люкс для VIP поездок',
        features: ['Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi', 'Экологичный'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Hongqi',
        model: 'EHS 9',
        license_plate: 'EHS9001'
      }
    }),

    // Минивэн KIA Carnival (MINIVAN)
    prisma.vehicle.create({
      data: {
        name: 'Kia Carnival',
        type: VehicleType.MINIVAN,
        capacity: 5,
        price_per_km: 2000,
        description: 'Просторный минивэн для группы до 5 человек',
        features: ['Климат-контроль', 'USB зарядка', 'Просторный салон'],
        status: VehicleStatus.AVAILABLE,
        brand: 'KIA',
        model: 'Carnival',
        license_plate: 'CARN001'
      }
    }),

    // Микроавтобус Mercedes-Benz Sprinter (MICROBUS)
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
        license_plate: 'SPRT001'
      }
    }),

    // Автобус Higer (BUS)
    prisma.vehicle.create({
      data: {
        name: 'Автобус Higer',
        type: VehicleType.BUS,
        capacity: 30,
        price_per_km: 3000,
        description: 'Большой автобус для групповых поездок до 30 человек',
        features: ['Кондиционер', 'Удобные сиденья', 'Большой багажник', 'Микрофон'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Higer',
        model: 'Bus',
        license_plate: 'HIGER001'
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


