import { Request, Response } from 'express'
import { AuthService } from '@/services/authService'
import { AdminRole } from '@prisma/client'

export class AuthController {
  /**
   * POST /api/auth/login - Вход администратора
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        })
        return
      }

      const result = await AuthService.login(email, password)

      res.json({
        success: true,
        data: result,
        message: 'Login successful'
      })
    } catch (error) {
      console.error('❌ Login error:', error)

      if (error instanceof Error) {
        if (error.message === 'Invalid email or password') {
          res.status(401).json({
            success: false,
            error: 'Invalid email or password'
          })
          return
        }

        if (error.message === 'Admin account is deactivated') {
          res.status(403).json({
            success: false,
            error: 'Admin account is deactivated'
          })
          return
        }
      }

      res.status(500).json({
        success: false,
        error: 'Login failed'
      })
    }
  }

  /**
   * POST /api/auth/admins - Создание нового администратора
   * (только для SUPER_ADMIN)
   */
  static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body

      if (!email || !password || !firstName || !lastName || !role) {
        res.status(400).json({
          success: false,
          error: 'All fields are required: email, password, firstName, lastName, role'
        })
        return
      }

      // Проверяем валидность роли
      if (!Object.values(AdminRole).includes(role)) {
        res.status(400).json({
          success: false,
          error: `Invalid role. Allowed roles: ${Object.values(AdminRole).join(', ')}`
        })
        return
      }

      const admin = await AuthService.createAdmin({
        email,
        password,
        firstName,
        lastName,
        role
      })

      res.status(201).json({
        success: true,
        data: admin,
        message: 'Admin created successfully'
      })
    } catch (error) {
      console.error('❌ Create admin error:', error)

      if (error instanceof Error && error.message === 'Admin with this email already exists') {
        res.status(409).json({
          success: false,
          error: 'Admin with this email already exists'
        })
        return
      }

      res.status(500).json({
        success: false,
        error: 'Failed to create admin'
      })
    }
  }

  /**
   * GET /api/auth/admins - Получение всех администраторов
   * (только для SUPER_ADMIN)
   */
  static async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const admins = await AuthService.getAllAdmins()

      res.json({
        success: true,
        data: admins
      })
    } catch (error) {
      console.error('❌ Get all admins error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admins'
      })
    }
  }

  /**
   * PUT /api/auth/admins/:id - Обновление администратора
   * (только для SUPER_ADMIN)
   */
  static async updateAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { email, firstName, lastName, role, isActive, password } = req.body

      const admin = await AuthService.updateAdmin(Number(id), {
        email,
        firstName,
        lastName,
        role,
        isActive,
        password
      })

      res.json({
        success: true,
        data: admin,
        message: 'Admin updated successfully'
      })
    } catch (error) {
      console.error('❌ Update admin error:', error)

      if (error instanceof Error) {
        if (error.message === 'Admin not found') {
          res.status(404).json({
            success: false,
            error: 'Admin not found'
          })
          return
        }

        if (error.message === 'Admin with this email already exists') {
          res.status(409).json({
            success: false,
            error: 'Admin with this email already exists'
          })
          return
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update admin'
      })
    }
  }

  /**
   * DELETE /api/auth/admins/:id - Удаление администратора
   * (только для SUPER_ADMIN)
   */
  static async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await AuthService.deleteAdmin(Number(id))

      res.json({
        success: true,
        message: 'Admin deleted successfully'
      })
    } catch (error) {
      console.error('❌ Delete admin error:', error)

      if (error instanceof Error) {
        if (error.message === 'Admin not found') {
          res.status(404).json({
            success: false,
            error: 'Admin not found'
          })
          return
        }

        if (error.message === 'Cannot delete the last super admin') {
          res.status(400).json({
            success: false,
            error: 'Cannot delete the last super admin'
          })
          return
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete admin'
      })
    }
  }

  /**
   * GET /api/auth/profile - Получение профиля текущего администратора
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
        return
      }

      const profile = await AuthService.getProfile(req.admin.id)

      res.json({
        success: true,
        data: profile
      })
    } catch (error) {
      console.error('❌ Get profile error:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      })
    }
  }

  /**
   * POST /api/auth/change-password - Изменение пароля
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
        return
      }

      const { oldPassword, newPassword } = req.body

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Old password and new password are required'
        })
        return
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters long'
        })
        return
      }

      await AuthService.changePassword(req.admin.id, oldPassword, newPassword)

      res.json({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (error) {
      console.error('❌ Change password error:', error)

      if (error instanceof Error && error.message === 'Invalid old password') {
        res.status(400).json({
          success: false,
          error: 'Invalid old password'
        })
        return
      }

      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      })
    }
  }
}

