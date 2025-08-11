import { Request, Response } from 'express'
import { SettingsService, CreateSettingData } from '@/services/settingsService'

export class SettingsController {
  // GET /api/admin/settings - Получить все настройки
  static async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      console.log('⚙️ Запрос всех настроек системы')

      const { category } = req.query

      let settings
      if (category && typeof category === 'string') {
        settings = await SettingsService.getSettingsByCategory(category)
        console.log(`📋 Получено ${settings.length} настроек для категории ${category}`)
      } else {
        settings = await SettingsService.getSettingsGroupedByCategory()
        console.log('📋 Получены все настройки, сгруппированные по категориям')
      }

      res.json({
        success: true,
        data: settings
      })
    } catch (error) {
      console.error('❌ Ошибка получения настроек:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch settings'
      })
    }
  }

  // GET /api/admin/settings/:key - Получить настройку по ключу
  static async getSettingByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params
      console.log(`⚙️ Запрос настройки по ключу: ${key}`)

      const setting = await SettingsService.getSettingByKey(key)

      if (!setting) {
        res.status(404).json({
          success: false,
          error: 'Setting not found'
        })
        return
      }

      // Преобразуем значение согласно типу
      let parsedValue: any = setting.value

      switch (setting.type) {
        case 'NUMBER':
          parsedValue = parseFloat(setting.value)
          break
        case 'BOOLEAN':
          parsedValue = setting.value === 'true'
          break
        case 'JSON':
          try {
            parsedValue = JSON.parse(setting.value)
          } catch {
            parsedValue = setting.value
          }
          break
      }

      res.json({
        success: true,
        data: {
          ...setting,
          parsedValue
        }
      })
    } catch (error) {
      console.error('❌ Ошибка получения настройки:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch setting'
      })
    }
  }

  // POST /api/admin/settings - Создать или обновить настройки
  static async upsertSettings(req: Request, res: Response): Promise<void> {
    try {
      const { settings } = req.body
      console.log('💾 Сохранение настроек:', settings)

      if (!Array.isArray(settings)) {
        res.status(400).json({
          success: false,
          error: 'Settings must be an array'
        })
        return
      }

      // Валидация настроек
      const validSettings: CreateSettingData[] = []

      for (const setting of settings) {
        if (!setting.key || !setting.category || setting.value === undefined) {
          console.warn('⚠️ Пропускаем некорректную настройку:', setting)
          continue
        }

        validSettings.push({
          key: setting.key,
          value: setting.value.toString(),
          type: setting.type || 'STRING',
          category: setting.category,
          description: setting.description
        })
      }

      if (validSettings.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid settings provided'
        })
        return
      }

      const results = await SettingsService.upsertManySettings(validSettings)

      console.log(`✅ Сохранено ${results.length} настроек`)

      res.json({
        success: true,
        data: results,
        message: `Successfully saved ${results.length} settings`
      })
    } catch (error) {
      console.error('❌ Ошибка сохранения настроек:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to save settings'
      })
    }
  }

  // PUT /api/admin/settings/:key - Обновить одну настройку
  static async updateSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params
      const { value, type, category, description } = req.body

      console.log(`✏️ Обновление настройки ${key}:`, { value, type, category })

      if (value === undefined) {
        res.status(400).json({
          success: false,
          error: 'Value is required'
        })
        return
      }

      const settingData: CreateSettingData = {
        key,
        value: value.toString(),
        type: type || 'STRING',
        category: category || 'general',
        description
      }

      const result = await SettingsService.upsertSetting(settingData)

      console.log(`✅ Настройка ${key} обновлена`)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('❌ Ошибка обновления настройки:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update setting'
      })
    }
  }

  // DELETE /api/admin/settings/:key - Удалить настройку
  static async deleteSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params
      console.log(`🗑️ Удаление настройки: ${key}`)

      const deleted = await SettingsService.deleteSetting(key)

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Setting not found or could not be deleted'
        })
        return
      }

      console.log(`✅ Настройка ${key} удалена`)

      res.json({
        success: true,
        message: 'Setting deleted successfully'
      })
    } catch (error) {
      console.error('❌ Ошибка удаления настройки:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to delete setting'
      })
    }
  }

  // POST /api/admin/settings/initialize - Инициализировать настройки по умолчанию
  static async initializeDefaultSettings(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔧 Инициализация настроек по умолчанию')

      const result = await SettingsService.initializeDefaultSettings()

      console.log('✅ Инициализация завершена:', result)

      res.json({
        success: true,
        data: result,
        message: `Initialized ${result.created} new settings, updated ${result.updated} existing settings`
      })
    } catch (error) {
      console.error('❌ Ошибка инициализации настроек:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to initialize default settings'
      })
    }
  }

  // GET /api/admin/settings/categories - Получить список категорий
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 Запрос категорий настроек')

      const settings = await SettingsService.getAllSettings()
      const categories = [...new Set(settings.map(s => s.category))].sort()

      console.log(`✅ Найдено ${categories.length} категорий:`, categories)

      res.json({
        success: true,
        data: categories
      })
    } catch (error) {
      console.error('❌ Ошибка получения категорий:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      })
    }
  }

  // GET /api/admin/settings/export - Экспорт всех настроек
  static async exportSettings(req: Request, res: Response): Promise<void> {
    try {
      console.log('📤 Экспорт настроек')

      const settings = await SettingsService.getAllSettings()

      // Подготавливаем данные для экспорта
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        settings: settings.map(setting => ({
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category: setting.category,
          description: setting.description
        }))
      }

      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename=stc-settings-export.json')

      res.json(exportData)
    } catch (error) {
      console.error('❌ Ошибка экспорта настроек:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to export settings'
      })
    }
  }
}
