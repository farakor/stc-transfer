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

  // Создание автомобилей на основе данных из мок сервиса
  const vehicles = await Promise.all([
    // Электромобиль Hongqi EHS 5 (SEDAN)
    ...Array.from({ length: 3 }, (_, i) => prisma.vehicle.create({
      data: {
        name: 'Электромобиль Hongqi EHS 5',
        type: VehicleType.SEDAN,
        capacity: 3,
        price_per_km: 1500,
        image_url: '/assets/ehs9.png',
        description: 'Комфортный электромобиль для поездок до 3 пассажиров',
        features: ['Электропривод', 'Кондиционер', 'Wi-Fi', 'USB зарядка'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Hongqi',
        model: 'EHS 5',
        license_plate: `EHS5${String(i + 1).padStart(3, '0')}`
      }
    })),

    // Электромобиль Hongqi EHS 9 (PREMIUM)
    ...Array.from({ length: 2 }, (_, i) => prisma.vehicle.create({
      data: {
        name: 'Электромобиль Hongqi EHS 9',
        type: VehicleType.PREMIUM,
        capacity: 3,
        price_per_km: 3000,
        image_url: '/assets/ehs9.png',
        description: 'Премиум электромобиль класса люкс для VIP поездок',
        features: ['Электропривод', 'Кожаные сиденья', 'Панорамная крыша', 'Премиум аудио', 'Wi-Fi'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Hongqi',
        model: 'EHS 9',
        license_plate: `EHS9${String(i + 1).padStart(3, '0')}`
      }
    })),

    // Kia Carnival (MINIVAN)
    ...Array.from({ length: 3 }, (_, i) => prisma.vehicle.create({
      data: {
        name: 'Kia Carnival',
        type: VehicleType.MINIVAN,
        capacity: 5,
        price_per_km: 2000,
        image_url: '/assets/carnival-kia-black-30.png',
        description: 'Просторный минивэн для группы до 5 человек',
        features: ['Климат-контроль', 'USB зарядка', 'Просторный салон', 'Багажник'],
        status: VehicleStatus.AVAILABLE,
        brand: 'KIA',
        model: 'Carnival',
        license_plate: `CARN${String(i + 1).padStart(3, '0')}`
      }
    })),

    // Mercedes-Benz Sprinter (MICROBUS)
    ...Array.from({ length: 2 }, (_, i) => prisma.vehicle.create({
      data: {
        name: 'Mercedes-Benz Sprinter',
        type: VehicleType.MICROBUS,
        capacity: 16,
        price_per_km: 2500,
        image_url: '/assets/mercedes-benz-sprinter.png',
        description: 'Микроавтобус для больших групп до 16 человек',
        features: ['Кондиционер', 'Большой багажник', 'Удобные сиденья', 'Высокая крыша'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Mercedes-Benz',
        model: 'Sprinter',
        license_plate: `SPRT${String(i + 1).padStart(3, '0')}`
      }
    })),

    // Автобус Higer (BUS)
    prisma.vehicle.create({
      data: {
        name: 'Автобус Higer',
        type: VehicleType.BUS,
        capacity: 30,
        price_per_km: 3000,
        image_url: '/assets/higer-bus.png',
        description: 'Комфортабельный автобус для больших групп до 30 человек',
        features: ['Кондиционер', 'Большой багажник', 'Мягкие сиденья', 'Система безопасности'],
        status: VehicleStatus.AVAILABLE,
        brand: 'Higer',
        model: 'Bus',
        license_plate: 'HIGER001'
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

  // Создание маршрутов на основе RouteService FIXED_PRICES
  const routes = await Promise.all([
    // Аэропорт и вокзал - популярные направления  
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Аэропорт',
        distance: 15,
        duration: 30,
        base_price: 0, // Используем фиксированные цены из RouteService
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Аэропорт Самарканда',
        distance: 15,
        duration: 30,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Железнодорожный вокзал',
        distance: 8,
        duration: 20,
        base_price: 0,
        is_popular: true
      }
    }),

    // Отели в городе - фиксированная цена 20,000 сум
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Hilton Samarkand Regency',
        distance: 5,
        duration: 15,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Silk Road by Minyoun',
        distance: 4,
        duration: 12,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Savitsky Plaza',
        distance: 3,
        duration: 10,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Lia! by Minyoun Stars of Ulugbek',
        distance: 6,
        duration: 18,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Hilton Garden Inn Samarkand Afrosiyob',
        distance: 7,
        duration: 20,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Hilton Garden Inn Samarkand Sogd',
        distance: 5,
        duration: 15,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Wellness Park Hotel Bactria',
        distance: 8,
        duration: 25,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Wellness Park Hotel Turon',
        distance: 9,
        duration: 27,
        base_price: 0,
        is_popular: true
      }
    }),

    // Достопримечательности города
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Конгресс центр',
        distance: 4,
        duration: 12,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Айван',
        distance: 3,
        duration: 10,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Вечный Город',
        distance: 5,
        duration: 15,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Фонтан',
        distance: 2,
        duration: 8,
        base_price: 0,
        is_popular: true
      }
    }),

    // Экскурсии и дальние поездки
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Экскурсия по Самарканду',
        distance: 50,
        duration: 180,
        base_price: 0,
        is_popular: true
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Поездка в Шахрисабз',
        distance: 80,
        duration: 90,
        base_price: 0,
        is_popular: false
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Поездка в Нурату',
        distance: 120,
        duration: 150,
        base_price: 0,
        is_popular: false
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Поездка в Бухару',
        distance: 270,
        duration: 240,
        base_price: 0,
        is_popular: false
      }
    }),
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Поездка в Ташкент',
        distance: 300,
        duration: 240,
        base_price: 0,
        is_popular: false
      }
    }),

    // Поездки по городу - почасовая оплата
    prisma.route.create({
      data: {
        from_city: 'Самарканд',
        to_city: 'Поездка по Самарканду',
        distance: 25,
        duration: 60,
        base_price: 0,
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
