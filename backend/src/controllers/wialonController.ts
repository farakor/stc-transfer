import { Request, Response } from 'express'
import { wialonService } from '@/services/wialonService'

export class WialonController {
  // GET /api/wialon/units - Получить все единицы транспорта из Wialon
  static async getUnits(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚌 Получение списка единиц транспорта из Wialon...')
      
      const units = await wialonService.getUnits()
      
      res.json({
        success: true,
        data: units,
        total: units.length
      })
    } catch (error) {
      console.error('❌ Error fetching Wialon units:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Wialon units',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // GET /api/wialon/units/:unitId - Получить информацию о конкретной единице
  static async getUnitById(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params
      console.log(`🔍 Получение информации о Wialon unit ${unitId}...`)
      
      const unit = await wialonService.getUnitById(unitId)
      
      if (!unit) {
        res.status(404).json({
          success: false,
          error: 'Wialon unit not found'
        })
        return
      }
      
      res.json({
        success: true,
        data: unit
      })
    } catch (error) {
      console.error('❌ Error fetching Wialon unit:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Wialon unit',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // GET /api/wialon/units/:unitId/position - Получить текущую позицию единицы
  static async getUnitPosition(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params
      console.log(`📍 Получение позиции Wialon unit ${unitId}...`)
      
      const position = await wialonService.getUnitPosition(unitId)
      
      if (!position) {
        res.status(404).json({
          success: false,
          error: 'Position not available for this unit'
        })
        return
      }
      
      res.json({
        success: true,
        data: position
      })
    } catch (error) {
      console.error('❌ Error fetching unit position:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch unit position',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // POST /api/wialon/login - Авторизация в Wialon (для тестирования)
  static async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 Авторизация в Wialon...')
      
      const sessionId = await wialonService.login()
      
      res.json({
        success: true,
        data: {
          sessionId
        }
      })
    } catch (error) {
      console.error('❌ Error logging into Wialon:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to login to Wialon',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // POST /api/wialon/logout - Выход из Wialon
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log('👋 Выход из Wialon...')
      
      await wialonService.logout()
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      console.error('❌ Error logging out from Wialon:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to logout from Wialon',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

