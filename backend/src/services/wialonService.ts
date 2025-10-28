import axios from 'axios'
import https from 'https'

interface WialonConfig {
  baseUrl: string
  token: string
}

interface WialonUnit {
  id: string
  name: string
  position?: {
    lat: number
    lng: number
    speed?: number
    course?: number
    time?: number
  }
  status?: 'online' | 'offline' | 'moving' | 'stopped'
}

export class WialonService {
  private config: WialonConfig
  private sessionId: string | null = null
  private axiosInstance: ReturnType<typeof axios.create>

  constructor() {
    // Загружаем конфигурацию из переменных окружения
    this.config = {
      baseUrl: process.env.WIALON_BASE_URL || 'http://176.74.220.111/wialon',
      token: process.env.WIALON_TOKEN || '85991e5f06896e98fe3c0bd49d2fe6d825770468546E156C3088DF44EB44163B2A478841'
    }

    // Создаем axios instance с отключенной проверкой SSL для self-signed сертификатов
    this.axiosInstance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Игнорируем ошибки SSL для самоподписанных сертификатов
      }) as any,
      timeout: 10000 // 10 секунд таймаут
    })
  }

  /**
   * Авторизация в Wialon через JSONP (используем прокси или direct)
   */
  async login(): Promise<string> {
    try {
      const response = await this.axiosInstance.get(`${this.config.baseUrl}/ajax.html`, {
        params: {
          svc: 'token/login',
          params: JSON.stringify({ token: this.config.token })
        }
      })

      if (response.data.error) {
        throw new Error(`Wialon login error: ${response.data.error}`)
      }

      this.sessionId = response.data.eid
      
      if (!this.sessionId) {
        throw new Error('Failed to get session ID from Wialon')
      }
      
      return this.sessionId
    } catch (error) {
      console.error('Failed to login to Wialon:', error)
      throw error
    }
  }

  /**
   * Получить список всех единиц транспорта из Wialon
   */
  async getUnits(): Promise<WialonUnit[]> {
    try {
      console.log('🚗 Getting Wialon units...')
      
      // Если нет сессии, авторизуемся
      if (!this.sessionId) {
        console.log('📝 No session, logging in...')
        await this.login()
      }

      console.log(`📡 Making request to ${this.config.baseUrl}/ajax.html`)
      
      const response = await this.axiosInstance.get(`${this.config.baseUrl}/ajax.html`, {
        params: {
          svc: 'core/search_items',
          params: JSON.stringify({
            spec: {
              itemsType: 'avl_unit',
              propName: 'sys_name',
              propValueMask: '*',
              sortType: 'sys_name'
            },
            force: 1,
            flags: 1 + 256 + 1024, // 1281 - базовая информация + позиция + статус
            from: 0,
            to: 0
          }),
          sid: this.sessionId
        }
      })

      console.log(`📦 Received response:`, response.data)

      // Проверка на ошибку сессии
      if (response.data.error === 4) {
        console.log('🔄 Session expired, re-authenticating...')
        // Сессия истекла, переавторизуемся
        this.sessionId = null
        await this.login()
        return this.getUnits() // Рекурсивный вызов
      }

      if (response.data.error) {
        console.error(`❌ Wialon API error: ${response.data.error}`)
        throw new Error(`Wialon API error: ${response.data.error}`)
      }

      const units = response.data.items || []
      console.log(`✅ Found ${units.length} Wialon units`)

      // Преобразуем в наш формат
      return units.map((unit: any) => {
        const wialonUnit: WialonUnit = {
          id: unit.id.toString(),
          name: unit.nm
        }

        // Добавляем позицию если доступна
        if (unit.pos) {
          wialonUnit.position = {
            lat: unit.pos.y,
            lng: unit.pos.x,
            speed: unit.pos.s || 0,
            course: unit.pos.c || 0,
            time: unit.pos.t || 0
          }

          // Определяем статус
          const currentTime = Math.floor(Date.now() / 1000)
          const timeDiff = currentTime - (unit.pos.t || 0)

          if (timeDiff > 600) {
            // Более 10 минут без данных
            wialonUnit.status = 'offline'
          } else if (unit.pos.s > 5) {
            // Скорость больше 5 км/ч
            wialonUnit.status = 'moving'
          } else {
            wialonUnit.status = 'stopped'
          }
        } else {
          wialonUnit.status = 'offline'
        }

        return wialonUnit
      })
    } catch (error: any) {
      console.error('❌ Failed to get Wialon units:', error.message)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      throw new Error(`Failed to fetch Wialon units: ${error.message}`)
    }
  }

  /**
   * Получить информацию о конкретной единице по ID
   */
  async getUnitById(unitId: string): Promise<WialonUnit | null> {
    try {
      const units = await this.getUnits()
      return units.find(unit => unit.id === unitId) || null
    } catch (error) {
      console.error(`Failed to get Wialon unit ${unitId}:`, error)
      return null
    }
  }

  /**
   * Получить текущую позицию единицы
   */
  async getUnitPosition(unitId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const unit = await this.getUnitById(unitId)
      return unit?.position ? { lat: unit.position.lat, lng: unit.position.lng } : null
    } catch (error) {
      console.error(`Failed to get position for unit ${unitId}:`, error)
      return null
    }
  }

  /**
   * Выход из сессии
   */
  async logout(): Promise<void> {
    if (!this.sessionId) return

    try {
      await this.axiosInstance.get(`${this.config.baseUrl}/ajax.html`, {
        params: {
          svc: 'core/logout',
          sid: this.sessionId
        }
      })
      this.sessionId = null
    } catch (error) {
      console.error('Failed to logout from Wialon:', error)
    }
  }
}

// Экспортируем единственный экземпляр сервиса
export const wialonService = new WialonService()

