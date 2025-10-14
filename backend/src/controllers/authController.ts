import { Request, Response } from 'express'
import { AuthService } from '@/services/authService'

export class AuthController {
  /**
   * POST /api/auth/telegram - Авторизация клиента через Telegram Web App
   */
  static async authenticateWithTelegram(req: Request, res: Response): Promise<void> {
    try {
      const { initData, userData } = req.body

      console.log('🔐 Авторизация клиента через Telegram...')
      console.log('📝 Init Data:', initData)
      console.log('👤 User Data:', userData)

      // Если есть initData, верифицируем его
      let verifiedUserData = userData
      if (initData) {
        try {
          verifiedUserData = AuthService.verifyTelegramWebAppData(initData)
          console.log('✅ Telegram Web App data verified')
        } catch (error) {
          console.warn('⚠️ Could not verify initData, using provided userData:', error)
          // Продолжаем с предоставленными данными, если верификация не удалась
        }
      }

      // Авторизуем пользователя
      const result = await AuthService.authenticateUser(verifiedUserData)

      console.log('✅ Пользователь авторизован:', result.user.id)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('❌ Error authenticating with Telegram:', error)
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * POST /api/auth/driver/telegram - Авторизация водителя через Telegram Web App
   */
  static async authenticateDriverWithTelegram(req: Request, res: Response): Promise<void> {
    try {
      const { initData, userData } = req.body

      console.log('🚗 Авторизация водителя через Telegram...')
      console.log('📝 Init Data:', initData)
      console.log('👤 User Data:', userData)

      // Если есть initData, верифицируем его
      let verifiedUserData = userData
      if (initData) {
        try {
          verifiedUserData = AuthService.verifyDriverTelegramWebAppData(initData)
          console.log('✅ Driver Telegram Web App data verified')
        } catch (error) {
          console.warn('⚠️ Could not verify initData, using provided userData:', error)
          // Продолжаем с предоставленными данными, если верификация не удалась
        }
      }

      // Авторизуем водителя
      const result = await AuthService.authenticateDriver(verifiedUserData)

      console.log('✅ Водитель авторизован:', result.driver.id)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('❌ Error authenticating driver with Telegram:', error)
      res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * PUT /api/auth/phone - Обновление номера телефона
   */
  static async updatePhone(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId // Из middleware
      const { phone } = req.body

      if (!phone) {
        res.status(400).json({
          success: false,
          error: 'Phone number is required',
        })
        return
      }

      console.log(`📞 Обновление номера телефона для пользователя ${userId}`)

      const result = await AuthService.updateUserPhone(userId, phone)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('❌ Error updating phone:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update phone number',
      })
    }
  }

  /**
   * GET /api/auth/me - Получение информации о текущем пользователе
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId // Из middleware

      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'No authorization token provided',
        })
        return
      }

      const token = authHeader.split(' ')[1]
      const user = await AuthService.getUserByToken(token)

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      console.error('❌ Error getting current user:', error)
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      })
    }
  }

  /**
   * POST /api/auth/logout - Выход из системы
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId // Из middleware

      console.log(`👋 Выход пользователя ${userId}`)

      await AuthService.logout(userId)

      res.json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      console.error('❌ Error logging out:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to logout',
      })
    }
  }
}
