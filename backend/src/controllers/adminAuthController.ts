import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export class AdminAuthController {
  /**
   * POST /api/admin/auth/login - Вход администратора
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        })
        return
      }

      // Ищем администратора по email
      const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (!admin) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        })
        return
      }

      // Проверяем, активен ли администратор
      if (!admin.is_active) {
        res.status(401).json({
          success: false,
          error: 'Account is disabled',
        })
        return
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, admin.password)
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        })
        return
      }

      // Генерируем JWT токен
      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          role: admin.role,
          type: 'admin',
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' } // Токен действителен 7 дней
      )

      // Обновляем время последнего входа
      await prisma.admin.update({
        where: { id: admin.id },
        data: { last_login: new Date() },
      })

      console.log(`✅ Admin logged in: ${admin.email}`)

      res.json({
        success: true,
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            firstName: admin.first_name,
            lastName: admin.last_name,
            role: admin.role,
            isActive: admin.is_active,
            lastLogin: admin.last_login,
            createdAt: admin.created_at,
          },
        },
      })
    } catch (error) {
      console.error('❌ Admin login error:', error)
      res.status(500).json({
        success: false,
        error: 'Login failed',
      })
    }
  }

  /**
   * GET /api/admin/auth/profile - Получить профиль текущего администратора
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Middleware authenticate устанавливает req.admin
      const admin = (req as any).admin

      if (!admin || !admin.id) {
        console.error('❌ Admin not found in request')
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        })
        return
      }

      console.log('📝 Fetching profile for admin ID:', admin.id)

      const adminData = await prisma.admin.findUnique({
        where: { id: admin.id },
      })

      if (!adminData) {
        console.error('❌ Admin not found with ID:', admin.id)
        res.status(404).json({
          success: false,
          error: 'Admin not found',
        })
        return
      }

      console.log('✅ Admin profile found:', adminData.email)

      res.json({
        success: true,
        data: {
          id: adminData.id,
          email: adminData.email,
          firstName: adminData.first_name,
          lastName: adminData.last_name,
          role: adminData.role,
          isActive: adminData.is_active,
          lastLogin: adminData.last_login,
          createdAt: adminData.created_at,
        },
      })
    } catch (error) {
      console.error('❌ Error fetching admin profile:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile',
      })
    }
  }

  /**
   * POST /api/admin/auth/change-password - Изменить пароль
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const admin = (req as any).admin
      const { oldPassword, newPassword } = req.body

      if (!admin || !admin.id) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        })
        return
      }

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Old password and new password are required',
        })
        return
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters',
        })
        return
      }

      const adminData = await prisma.admin.findUnique({
        where: { id: admin.id },
      })

      if (!adminData) {
        res.status(404).json({
          success: false,
          error: 'Admin not found',
        })
        return
      }

      // Проверяем старый пароль
      const isOldPasswordValid = await bcrypt.compare(oldPassword, adminData.password)
      if (!isOldPasswordValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid old password',
        })
        return
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Обновляем пароль
      await prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      })

      console.log(`✅ Admin password changed: ${adminData.email}`)

      res.json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error) {
      console.error('❌ Error changing password:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to change password',
      })
    }
  }

  /**
   * GET /api/admin/auth/admins - Получить всех администраторов (только SUPER_ADMIN)
   */
  static async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const admins = await prisma.admin.findMany({
        orderBy: { created_at: 'desc' },
      })

      res.json({
        success: true,
        data: admins.map((admin) => ({
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role,
          isActive: admin.is_active,
          lastLogin: admin.last_login,
          createdAt: admin.created_at,
        })),
      })
    } catch (error) {
      console.error('❌ Error fetching admins:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admins',
      })
    }
  }

  /**
   * POST /api/admin/auth/admins - Создать нового администратора (только SUPER_ADMIN)
   */
  static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body

      if (!email || !password || !firstName || !lastName || !role) {
        res.status(400).json({
          success: false,
          error: 'All fields are required',
        })
        return
      }

      // Проверяем, существует ли уже администратор с таким email
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingAdmin) {
        res.status(400).json({
          success: false,
          error: 'Admin with this email already exists',
        })
        return
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10)

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
      })

      console.log(`✅ Admin created: ${admin.email}`)

      res.status(201).json({
        success: true,
        data: {
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role,
          isActive: admin.is_active,
          createdAt: admin.created_at,
        },
      })
    } catch (error) {
      console.error('❌ Error creating admin:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create admin',
      })
    }
  }

  /**
   * PUT /api/admin/auth/admins/:id - Обновить администратора (только SUPER_ADMIN)
   */
  static async updateAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { email, password, firstName, lastName, role, isActive } = req.body

      const updateData: any = {}

      if (email) updateData.email = email.toLowerCase()
      if (password) updateData.password = await bcrypt.hash(password, 10)
      if (firstName) updateData.first_name = firstName
      if (lastName) updateData.last_name = lastName
      if (role) updateData.role = role
      if (typeof isActive === 'boolean') updateData.is_active = isActive

      const admin = await prisma.admin.update({
        where: { id: Number(id) },
        data: updateData,
      })

      console.log(`✅ Admin updated: ${admin.email}`)

      res.json({
        success: true,
        data: {
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role,
          isActive: admin.is_active,
          lastLogin: admin.last_login,
          createdAt: admin.created_at,
        },
      })
    } catch (error) {
      console.error('❌ Error updating admin:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update admin',
      })
    }
  }

  /**
   * DELETE /api/admin/auth/admins/:id - Удалить администратора (только SUPER_ADMIN)
   */
  static async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const admin = (req as any).admin

      // Нельзя удалить самого себя
      if (Number(id) === admin.id) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete your own account',
        })
        return
      }

      await prisma.admin.delete({
        where: { id: Number(id) },
      })

      console.log(`✅ Admin deleted: ${id}`)

      res.json({
        success: true,
        message: 'Admin deleted successfully',
      })
    } catch (error) {
      console.error('❌ Error deleting admin:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete admin',
      })
    }
  }
}

