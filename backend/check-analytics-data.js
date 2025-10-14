const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Проверка данных в базе...\n');

  try {
    // Общая статистика
    const totalBookings = await prisma.booking.count();
    const totalDrivers = await prisma.driver.count();
    const totalUsers = await prisma.user.count();
    const totalVehicles = await prisma.vehicle.count();

    console.log('📊 Общая статистика:');
    console.log(`   Всего заказов: ${totalBookings}`);
    console.log(`   Всего водителей: ${totalDrivers}`);
    console.log(`   Всего пользователей: ${totalUsers}`);
    console.log(`   Всего автомобилей: ${totalVehicles}`);
    console.log('');

    // Статистика по статусам
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('📊 Заказы по статусам:');
    bookingsByStatus.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`);
    });
    console.log('');

    // Последние заказы
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        booking_number: true,
        status: true,
        from_location: true,
        to_location: true,
        total_price: true,
        created_at: true
      }
    });

    console.log('📊 Последние 5 заказов:');
    recentBookings.forEach(booking => {
      console.log(`   ${booking.booking_number}: ${booking.from_location} → ${booking.to_location}`);
      console.log(`      Статус: ${booking.status}, Цена: ${booking.total_price}, Дата: ${booking.created_at}`);
    });
    console.log('');

    // Статистика водителей
    const driversStatus = await prisma.driver.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('📊 Водители по статусам:');
    driversStatus.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`);
    });
    console.log('');

    // Проверяем данные за сегодня
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const todayBookings = await prisma.booking.count({
      where: {
        created_at: {
          gte: today
        }
      }
    });

    console.log(`📊 Заказов за сегодня: ${todayBookings}`);
    console.log('');

    // Проверяем данные за последнюю неделю
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekBookings = await prisma.booking.count({
      where: {
        created_at: {
          gte: weekAgo
        }
      }
    });

    console.log(`📊 Заказов за последнюю неделю: ${weekBookings}`);
    console.log('');

    if (totalBookings === 0) {
      console.log('⚠️  ВНИМАНИЕ: В базе данных нет заказов!');
      console.log('   Создайте несколько заказов через приложение, чтобы увидеть данные в аналитике.');
    } else {
      console.log('✅ В базе есть данные. Аналитика должна работать!');
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

