import { prisma } from './prisma'
import { VehicleType, VehicleStatus, DriverStatus, RouteType } from '@prisma/client'

async function main() {
  console.log('🌱 Starting database seeding...')

  // Очистка базы данных
  await prisma.booking.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.route.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Создание автомобилей
  const vehicles = await Promise.all([
    // Седаны Hongqi EHS 5
    ...Array.from({ length: 10 }, (_, i) => prisma.vehicle.create({
      data: {
        name: 'Hongqi EHS 5',
        type: VehicleType.SEDAN,
        capacity: 3,
        price_per_km: 1500,
        description: 'Комфортный седан для поездок до 3 пассажиров',
        features: ['Кондиционер', 'Wi-Fi', 'USB зарядка'],
        status: VehicleStatus.AVAILABLE
      }
    })),

    // Премиум Hongqi EHS 9
    ...Array.from({ length: 2 }, (_, i) => prisma.vehicle.create({
      data: {
        name: 'Hongqi EHS 9',
        type: VehicleType.PREMIUM,
        capacity: 3,
        price_per_km: 3000,
        description: 'Премиум седан класса люкс для VIP поездок',
        features: ['Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi'],
        status: VehicleStatus.AVAILABLE
      }
    })),

    // Минивэны KIA Carnival
    ...Array.from({ length: 4 }, (_, i) => prisma.vehicle.create({
      data: {
        name: 'KIA Carnival',
        type: VehicleType.MINIVAN,
        capacity: 5,
        price_per_km: 2000,
        description: 'Просторный минивэн для группы до 5 человек',
        features: ['Климат-контроль', 'USB зарядка', 'Просторный салон'],
        status: VehicleStatus.AVAILABLE
      }
    })),

    // Микроавтобус Mercedes-Benz Sprinter
    prisma.vehicle.create({
      data: {
        name: 'Mercedes-Benz Sprinter',
        type: VehicleType.MICROBUS,
        capacity: 16,
        price_per_km: 2500,
        description: 'Микроавтобус для больших групп до 16 человек',
        features: ['Кондиционер', 'Большой багажник', 'Удобные сиденья'],
        status: VehicleStatus.AVAILABLE
      }
    })
  ])

  console.log(`🚗 Created ${vehicles.length} vehicles`)

  // Создание водителей
  const driverData = [
    { name: 'Бобомуродов Жахонгир', phone: '998991723113' },
    { name: 'Мансуров Дилшод', phone: '998902518959' },
    { name: 'Мухамадиев Зокир', phone: '998915428606' },
    { name: 'Хусанов Жамшед', phone: '998942863918' },
    { name: 'Хакимов Фируз', phone: '998915210787' },
    { name: 'Хамидов Эркин', phone: '998972890383' },
    { name: 'Сувонов Одил', phone: '998901907420' },
    { name: 'Хусанов Руслан', phone: '998904452270' },
    { name: 'Мелибаев Ойбек', phone: '998979210111' },
    { name: 'Шадиев Шухрат', phone: '998901957555' },
    { name: 'Раджабов Санжар', phone: '998915500010' },
    { name: 'Облокулов Дилшод', phone: '998915285814' },
    { name: 'Шодиев Бахтиёр', phone: '998941857777' }
  ]

  const drivers = await Promise.all(
    driverData.slice(0, vehicles.length).map((driver, index) =>
      prisma.driver.create({
        data: {
          name: driver.name,
          phone: driver.phone,
          license: `DL${String(1000000 + index).substring(1)}`,
          vehicle_id: vehicles[index].id,
          status: DriverStatus.AVAILABLE
        }
      })
    )
  )

  console.log(`👥 Created ${drivers.length} drivers`)

  // Создание маршрутов
  const routes = await Promise.all([
    // Фиксированные маршруты
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Аэропорт Самарканда',
        distance: 15,
        duration: 30,
        base_price: 150000,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Железнодорожный вокзал',
        distance: 8,
        duration: 20,
        base_price: 150000,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Достопримечательности Самарканда',
        distance: 50,
        duration: 180,
        base_price: 845000,
        is_popular: true
      }
    }),
    // Дальние маршруты
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Шахрисабз',
        distance: 80,
        duration: 90,
        base_price: 2200000,
        is_popular: false
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Нурату',
        distance: 120,
        duration: 150,
        base_price: 3000000,
        is_popular: false
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Бухара',
        distance: 270,
        duration: 240,
        base_price: 3600000,
        is_popular: false
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Ташкент',
        distance: 300,
        duration: 240,
        base_price: 3900000,
        is_popular: false
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'В пределах города',
        distance: 25,
        duration: 60,
        base_price: 150000,
        is_popular: true
      }
    })
  ])

  console.log(`🛣️ Created ${routes.length} routes`)

  // Пропускаем создание тарификации так как модель pricing не существует
  console.log('💰 Skipped pricing entries (model not exists in schema)')

  // Создание тестового пользователя
  const testUser = await prisma.user.create({
    data: {
      telegram_id: '12345',
      name: 'Тестовый пользователь',
      phone: '+998901234567',
      language_code: 'ru'
    }
  })

  console.log(`👤 Created test user: ${testUser.name}`)

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
