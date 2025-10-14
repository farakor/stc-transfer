const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = process.argv[2] || "admin@stc.uz";
    const password = process.argv[3] || "admin123";
    const firstName = process.argv[4] || "Admin";
    const lastName = process.argv[5] || "User";
    const role = process.argv[6] || "SUPER_ADMIN";

    // Проверяем, существует ли администратор
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      console.log(`❌ Администратор с email ${email} уже существует`);
      process.exit(1);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем администратора
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role,
        is_active: true,
      },
    });

    console.log("✅ Администратор успешно создан!");
    console.log("");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Пароль:", password);
    console.log("👤 Имя:", `${admin.first_name} ${admin.last_name}`);
    console.log("🎭 Роль:", admin.role);
    console.log("");
    console.log("Теперь вы можете войти в админ-панель:");
    console.log("http://localhost:3001/admin/login");
  } catch (error) {
    console.error("❌ Ошибка создания администратора:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
