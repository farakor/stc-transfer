import { prisma } from '@/utils/prisma'
import { generateToken } from '@/middleware/auth'
import { AdminRole } from '@prisma/client'
import crypto from 'crypto'

/**
 * Функция для хеширования пароля с использованием crypto (встроенный модуль Node.js)
 */
const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Функция для проверки пароля
 */
const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, originalHash] = hashedPassword.split(':')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === originalHash
}

export class AuthService {
  /**
   * Вход администратора в систему
   */
  static async login(email: string, password: string) {
    // Находим администратора по email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!admin) {
      throw new Error('Invalid email or password')
    }

    if (!admin.is_active) {
      throw new Error('Admin account is deactivated')
    }

    // Проверяем пароль
    const isValidPassword = verifyPassword(password, admin.password)

    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Обновляем время последнего входа
    await prisma.admin.update({
      where: { id: admin.id },
      data: { last_login: new Date() }
    })

    // Генерируем токен
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role
    })

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        lastLogin: admin.last_login
      }
    }
  }

  /**
   * Создание нового администратора
   * (только SUPER_ADMIN может создавать других администраторов)
   */
  static async createAdmin(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: AdminRole
  }) {
    // Проверяем, существует ли уже администратор с таким email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase() }
    })

    if (existingAdmin) {
      throw new Error('Admin with this email already exists')
    }

    // Хешируем пароль
    const hashedPassword = hashPassword(data.password)

    // Создаем администратора
    const admin = await prisma.admin.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        is_active: true
      }
    })

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      isActive: admin.is_active,
      createdAt: admin.created_at
    }
  }

  /**
   * Получение всех администраторов
   */
  static async getAllAdmins() {
    const admins = await prisma.admin.findMany({
      orderBy: { created_at: 'desc' }
    })

    return admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      isActive: admin.is_active,
      lastLogin: admin.last_login,
      createdAt: admin.created_at
    }))
  }

  /**
   * Обновление данных администратора
   */
  static async updateAdmin(
    id: number,
    data: {
      email?: string
      firstName?: string
      lastName?: string
      role?: AdminRole
      isActive?: boolean
      password?: string
    }
  ) {
    const updateData: any = {}

    if (data.email) {
      // Проверяем, не занят ли новый email
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: data.email.toLowerCase() }
      })

      if (existingAdmin && existingAdmin.id !== id) {
        throw new Error('Admin with this email already exists')
      }

      updateData.email = data.email.toLowerCase()
    }

    if (data.firstName) updateData.first_name = data.firstName
    if (data.lastName) updateData.last_name = data.lastName
    if (data.role) updateData.role = data.role
    if (data.isActive !== undefined) updateData.is_active = data.isActive

    if (data.password) {
      updateData.password = hashPassword(data.password)
    }

    updateData.updated_at = new Date()

    const admin = await prisma.admin.update({
      where: { id },
      data: updateData
    })

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      isActive: admin.is_active,
      updatedAt: admin.updated_at
    }
  }

  /**
   * Удаление администратора
   */
  static async deleteAdmin(id: number) {
    // Проверяем, что удаляем не последнего SUPER_ADMIN
    const admin = await prisma.admin.findUnique({
      where: { id }
    })

    if (!admin) {
      throw new Error('Admin not found')
    }

    if (admin.role === AdminRole.SUPER_ADMIN) {
      const superAdminCount = await prisma.admin.count({
        where: { role: AdminRole.SUPER_ADMIN }
      })

      if (superAdminCount <= 1) {
        throw new Error('Cannot delete the last super admin')
      }
    }

    await prisma.admin.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
   * Получение профиля текущего администратора
   */
  static async getProfile(adminId: number) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      throw new Error('Admin not found')
    }

    return {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name,
      lastName: admin.last_name,
      role: admin.role,
      isActive: admin.is_active,
      lastLogin: admin.last_login,
      createdAt: admin.created_at
    }
  }

  /**
   * Изменение пароля
   */
  static async changePassword(adminId: number, oldPassword: string, newPassword: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      throw new Error('Admin not found')
    }

    // Проверяем старый пароль
    const isValidPassword = verifyPassword(oldPassword, admin.password)

    if (!isValidPassword) {
      throw new Error('Invalid old password')
    }

    // Хешируем новый пароль
    const hashedPassword = hashPassword(newPassword)

    await prisma.admin.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
        updated_at: new Date()
      }
    })

    return { success: true }
  }
}

// Экспортируем функции хеширования для использования в других местах
export { hashPassword, verifyPassword }

