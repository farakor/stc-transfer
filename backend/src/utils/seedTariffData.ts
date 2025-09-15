import { prisma } from './prisma'

export async function seedTariffData() {
  console.log('🌱 Seeding tariff constructor data...')

  // Проверяем, есть ли уже данные
  const existingLocations = await prisma.location.count()
  if (existingLocations > 0) {
    console.log(`✅ Found ${existingLocations} existing locations, skipping seed`)
    return
  }

  try {
    // Добавляем базовые локации
    const locations = await Promise.all([
      prisma.location.create({
        data: {
          name: 'Самарканд (центр)',
          type: 'city'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Аэропорт Самарканда',
          type: 'airport'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Железнодорожный вокзал',
          type: 'station'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Регистан',
          type: 'attraction'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Гур-Эмир',
          type: 'attraction'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Шахи-Зинда',
          type: 'attraction'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Шахрисабз',
          type: 'city'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Нурата',
          type: 'city'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Бухара',
          type: 'city'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Ташкент',
          type: 'city'
        }
      }),
      prisma.location.create({
        data: {
          name: 'Хива',
          type: 'city'
        }
      })
    ])

    console.log(`✅ Created ${locations.length} locations`)

    // Создаем основные маршруты из Самарканда
    const samarkandCenter = locations.find(l => l.name === 'Самарканд (центр)')!
    const routes = []

    const routeData = [
      { to: 'Аэропорт Самарканда', distance: 15, duration: 25 },
      { to: 'Железнодорожный вокзал', distance: 8, duration: 15 },
      { to: 'Регистан', distance: 5, duration: 10 },
      { to: 'Гур-Эмир', distance: 3, duration: 8 },
      { to: 'Шахи-Зинда', distance: 4, duration: 12 },
      { to: 'Шахрисабз', distance: 90, duration: 120 },
      { to: 'Нурата', distance: 180, duration: 240 },
      { to: 'Бухара', distance: 280, duration: 360 },
      { to: 'Ташкент', distance: 320, duration: 420 },
      { to: 'Хива', distance: 450, duration: 600 }
    ]

    for (const route of routeData) {
      const toLocation = locations.find(l => l.name === route.to)!

      // Маршрут туда
      const routeTo = await prisma.tariffRoute.create({
        data: {
          from_location_id: samarkandCenter.id,
          to_location_id: toLocation.id,
          distance_km: route.distance,
          estimated_duration_minutes: route.duration
        }
      })
      routes.push(routeTo)

      // Маршрут обратно
      const routeBack = await prisma.tariffRoute.create({
        data: {
          from_location_id: toLocation.id,
          to_location_id: samarkandCenter.id,
          distance_km: route.distance,
          estimated_duration_minutes: route.duration
        }
      })
      routes.push(routeBack)
    }

    console.log(`✅ Created ${routes.length} routes`)
    console.log('🎉 Tariff constructor data seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding tariff data:', error)
    throw error
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  seedTariffData()
    .then(() => {
      console.log('✅ Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}
