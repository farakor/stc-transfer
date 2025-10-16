/**
 * Тестовый скрипт для проверки уведомлений водителю
 *
 * Использование:
 * node backend/test-driver-notification.js <telegram_id> <booking_id>
 *
 * Пример:
 * node backend/test-driver-notification.js 123456789 clm123abc456
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDriverNotification() {
  const telegramId = process.argv[2];
  const bookingId = process.argv[3];

  if (!telegramId) {
    console.error("❌ Ошибка: укажите telegram_id водителя");
    console.log(
      "Использование: node backend/test-driver-notification.js <telegram_id> [booking_id]"
    );
    process.exit(1);
  }

  try {
    console.log("🔍 Поиск водителя с telegram_id:", telegramId);

    // Находим водителя
    const driver = await prisma.driver.findFirst({
      where: { telegram_id: telegramId },
      include: { vehicle: true },
    });

    if (!driver) {
      console.error("❌ Водитель с telegram_id", telegramId, "не найден");
      console.log("\n💡 Доступные водители с telegram_id:");

      const driversWithTelegram = await prisma.driver.findMany({
        where: {
          telegram_id: { not: null },
        },
        select: {
          id: true,
          name: true,
          telegram_id: true,
          phone: true,
        },
      });

      if (driversWithTelegram.length > 0) {
        driversWithTelegram.forEach((d) => {
          console.log(
            `  - ${d.name} (ID: ${d.id}, Telegram: ${d.telegram_id}, Тел: ${d.phone})`
          );
        });
      } else {
        console.log("  Нет водителей с привязанным Telegram");
      }

      process.exit(1);
    }

    console.log("✅ Водитель найден:", driver.name);

    let booking;

    if (bookingId) {
      // Используем указанный заказ
      console.log("🔍 Поиск заказа:", bookingId);
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { user: true, vehicle: true, driver: true },
      });

      if (!booking) {
        console.error("❌ Заказ не найден");
        process.exit(1);
      }
    } else {
      // Ищем активный заказ водителя или создаем тестовый
      console.log("🔍 Поиск активного заказа водителя...");

      const activeBooking = await prisma.booking.findFirst({
        where: {
          driver_id: driver.id,
          status: { in: ["VEHICLE_ASSIGNED", "CONFIRMED", "IN_PROGRESS"] },
        },
        include: { user: true, vehicle: true, driver: true },
      });

      if (activeBooking) {
        booking = activeBooking;
        console.log(
          "✅ Найден активный заказ:",
          booking.booking_number || booking.id
        );
      } else {
        console.log("⚠️  Активных заказов не найдено");
        console.log("📝 Создаем тестовый заказ для демонстрации...");

        // Находим тестового пользователя
        let testUser = await prisma.user.findFirst({
          where: {
            OR: [{ telegram_id: "123456789" }, { phone: { contains: "test" } }],
          },
        });

        if (!testUser) {
          // Создаем тестового пользователя
          testUser = await prisma.user.create({
            data: {
              telegram_id: "123456789",
              first_name: "Тестовый",
              last_name: "Пользователь",
              phone: "+998901234567",
              language_code: "ru",
            },
          });
        }

        // Создаем тестовый заказ
        const bookingCount = await prisma.booking.count();
        const bookingNumber = `СТТ-${String(bookingCount + 1).padStart(
          5,
          "0"
        )}`;

        booking = await prisma.booking.create({
          data: {
            booking_number: bookingNumber,
            from_location: "Ташкент, Мирзо-Улугбекский район",
            to_location: "Самарканд, центр города",
            pickup_location: "ул. Амира Тимура, 12",
            dropoff_location: "площадь Регистан",
            vehicle_type: "SEDAN",
            passenger_count: 3,
            price: 250000,
            total_price: 250000,
            distance_km: 270,
            status: "VEHICLE_ASSIGNED",
            user_id: testUser.id,
            driver_id: driver.id,
            vehicle_id: driver.vehicle_id,
            notes: "С детским креслом, пожалуйста",
            pickup_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // Через 2 часа
          },
          include: { user: true, vehicle: true, driver: true },
        });

        console.log("✅ Тестовый заказ создан:", booking.booking_number);
      }
    }

    console.log("\n📤 Отправка уведомления водителю...");
    console.log("Детали заказа:");
    console.log("  Номер:", booking.booking_number || booking.id);
    console.log("  Маршрут:", booking.from_location, "→", booking.to_location);
    console.log("  Пассажир:", booking.user.name || booking.user.first_name);
    console.log("  Телефон:", booking.user.phone);
    console.log("  Стоимость:", booking.price, "сум");
    console.log("  Статус:", booking.status);

    // Динамический импорт сервиса
    const {
      DriverTelegramBotService,
    } = require("./dist/services/driverTelegramBot");

    const driverBot = DriverTelegramBotService.getInstance();

    if (!driverBot.isDriverBotEnabled()) {
      console.error("\n❌ Водительский бот отключен!");
      console.log("Проверьте настройки:");
      console.log(
        "  TELEGRAM_DRIVER_BOT_TOKEN =",
        process.env.TELEGRAM_DRIVER_BOT_TOKEN
          ? "✅ Установлен"
          : "❌ Не установлен"
      );
      console.log(
        "  TELEGRAM_DRIVER_WEBHOOK_URL =",
        process.env.TELEGRAM_DRIVER_WEBHOOK_URL || "❌ Не установлен"
      );
      process.exit(1);
    }

    await driverBot.sendNewOrderNotification(telegramId, booking);

    console.log("\n✅ Уведомление успешно отправлено!");
    console.log("Проверьте Telegram бот водителя");
  } catch (error) {
    console.error("\n❌ Ошибка:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDriverNotification();
