const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.log(
        "❌ Использование: node check-password.js <email> <password>"
      );
      process.exit(1);
    }

    // Ищем администратора
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      console.log(`❌ Администратор с email ${email} не найден`);
      process.exit(1);
    }

    console.log("📧 Email:", admin.email);
    console.log("👤 Имя:", `${admin.first_name} ${admin.last_name}`);
    console.log("🎭 Роль:", admin.role);
    console.log("✅ Активен:", admin.is_active ? "Да" : "Нет");
    console.log("");

    // Проверяем пароль
    const isValid = await bcrypt.compare(password, admin.password);

    if (isValid) {
      console.log("✅ Пароль ПРАВИЛЬНЫЙ!");
      console.log("");
      console.log("Используйте эти данные для входа:");
      console.log(`Email: ${admin.email}`);
      console.log(`Пароль: ${password}`);
    } else {
      console.log("❌ Пароль НЕПРАВИЛЬНЫЙ!");
      console.log("");
      console.log("Для сброса пароля используйте:");
      console.log(`node reset-password.js ${admin.email} <новый_пароль>`);
    }
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
