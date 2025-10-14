import { Request, Response } from 'express'
import { wialonService } from '@/services/wialonService'

/**
 * Публичный контроллер для отслеживания транспорта
 * Доступен клиентам без авторизации
 */
export class TrackingController {
  /**
   * GET /api/tracking/vehicles/:unitId/position
   * Получить текущую позицию транспорта
   */
  static async getVehiclePosition(req: Request, res: Response): Promise<void> {
    try {
      const { unitId } = req.params
      console.log(`📍 Public tracking: Получение позиции для unit ${unitId}...`)
      
      const unit = await wialonService.getUnitById(unitId)
      
      if (!unit) {
        res.status(404).json({
          success: false,
          error: 'Транспорт не найден'
        })
        return
      }

      // Возвращаем только необходимую информацию для отслеживания
      res.json({
        success: true,
        data: {
          id: unit.id,
          name: unit.name,
          position: unit.position,
          status: unit.status
        }
      })
    } catch (error) {
      console.error('❌ Error fetching vehicle position:', error)
      res.status(500).json({
        success: false,
        error: 'Не удалось получить позицию транспорта',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

