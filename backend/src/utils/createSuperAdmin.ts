import { prisma } from './prisma'
import { AdminRole } from '@prisma/client'
import crypto from 'crypto'

/**
 * Функция для хеширования пароля
 */
const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Скрипт для создания суперадминистратора
 */
async function createSuperAdmin() {
  try {
    console.log('🔧 Создание суперадминистратора...')

    const email = 'farrukh.oripov@gmail.com'
    const password = 'eNL+i6wQ$56Kj?W'
    const firstName = 'Farrukh'
    const lastName = 'Oripov'

    // Проверяем, существует ли уже администратор с таким email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log('⚠️  Суперадминистратор с таким email уже существует')
      
      // Обновляем существующего администратора
      const updatedAdmin = await prisma.admin.update({
        where: { email },
        data: {
          password: hashPassword(password),
          first_name: firstName,
          last_name: lastName,
          role: AdminRole.SUPER_ADMIN,
          is_active: true,
          updated_at: new Date()
        }
      })

      console.log('✅ Суперадминистратор обновлен:')
      console.log(`   Email: ${updatedAdmin.email}`)
      console.log(`   Имя: ${updatedAdmin.first_name} ${updatedAdmin.last_name}`)
      console.log(`   Роль: ${updatedAdmin.role}`)
      console.log(`   Статус: ${updatedAdmin.is_active ? 'Активен' : 'Неактивен'}`)
      return
    }

    // Хешируем пароль
    const hashedPassword = hashPassword(password)

    // Создаем суперадминистратора
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: AdminRole.SUPER_ADMIN,
        is_active: true
      }
    })

    console.log('✅ Суперадминистратор успешно создан:')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Имя: ${admin.first_name} ${admin.last_name}`)
    console.log(`   Роль: ${admin.role}`)
    console.log(`   Пароль: ${password}`)
    console.log('')
    console.log('🔐 Данные для входа:')
    console.log(`   Email: ${email}`)
    console.log(`   Пароль: ${password}`)
    console.log('')
    console.log('🌐 Используйте эти данные для входа в админ-панель')

  } catch (error) {
    console.error('❌ Ошибка при создании суперадминистратора:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Запускаем скрипт
createSuperAdmin()
  .then(() => {
    console.log('✅ Скрипт выполнен успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Ошибка выполнения скрипта:', error)
    process.exit(1)
  })

