const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log(
        "❌ Использование: node reset-password.js <email> <новый_пароль>"
      );
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log("❌ Пароль должен быть минимум 6 символов");
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

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    console.log("✅ Пароль успешно изменен!");
    console.log("");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Новый пароль:", newPassword);
    console.log("👤 Имя:", `${admin.first_name} ${admin.last_name}`);
    console.log("🎭 Роль:", admin.role);
    console.log("");
    console.log("Теперь вы можете войти с новым паролем:");
    console.log("http://localhost:3001/admin/login");
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
