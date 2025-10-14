import api from './api'

// Интерфейсы для Telegram Web App
interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  ready: () => void
  expand: () => void
  close: () => void
  sendData: (data: string) => void
}

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

// Расширение объекта window для Telegram Web App
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

// Класс для работы с Telegram Web App
export class TelegramAuthService {
  private static webApp: TelegramWebApp | null = null

  /**
   * Инициализация Telegram Web App
   */
  static init(): TelegramWebApp | null {
    if (typeof window === 'undefined') {
      return null
    }

    if (window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp
      this.webApp.ready()
      this.webApp.expand()
      
      console.log('✅ Telegram Web App initialized')
      console.log('📱 Platform:', this.webApp.platform)
      console.log('🎨 Color Scheme:', this.webApp.colorScheme)
      console.log('👤 User:', this.webApp.initDataUnsafe.user)
      
      return this.webApp
    }

    console.warn('⚠️ Telegram Web App not available')
    return null
  }

  /**
   * Получить экземпляр Telegram Web App
   */
  static getWebApp(): TelegramWebApp | null {
    if (!this.webApp) {
      this.init()
    }
    return this.webApp
  }

  /**
   * Проверка, запущено ли приложение в Telegram
   */
  static isTelegramWebApp(): boolean {
    return !!window.Telegram?.WebApp
  }

  /**
   * Получить данные пользователя из Telegram
   */
  static getUser(): TelegramUser | null {
    const webApp = this.getWebApp()
    return webApp?.initDataUnsafe.user || null
  }

  /**
   * Получить initData для отправки на сервер
   */
  static getInitData(): string {
    const webApp = this.getWebApp()
    return webApp?.initData || ''
  }

  /**
   * Авторизация через Telegram
   */
  static async authenticate() {
    try {
      const webApp = this.getWebApp()
      const user = this.getUser()

      if (!user) {
        throw new Error('Telegram user data not available')
      }

      console.log('🔐 Authenticating with Telegram...')

      // Отправляем данные на сервер для авторизации
      const response = await api.post('/auth/telegram', {
        initData: this.getInitData(),
        userData: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          photo_url: user.photo_url,
        },
      })

      if (response.data.success) {
        const { authToken, user: userData } = response.data.data

        // Сохраняем токен в localStorage
        localStorage.setItem('authToken', authToken)
        localStorage.setItem('user', JSON.stringify(userData))

        console.log('✅ Authentication successful')
        console.log('👤 User:', userData)

        return {
          token: authToken,
          user: userData,
        }
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error) {
      console.error('❌ Authentication error:', error)
      throw error
    }
  }

  /**
   * Получить сохраненный токен
   */
  static getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  /**
   * Получить сохраненного пользователя
   */
  static getSavedUser(): any | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (error) {
        return null
      }
    }
    return null
  }

  /**
   * Проверка авторизации
   */
  static isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  /**
   * Выход из системы
   */
  static async logout() {
    try {
      const token = this.getAuthToken()
      if (token) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  /**
   * Показать кнопку "Назад"
   */
  static showBackButton(callback: () => void) {
    const webApp = this.getWebApp()
    if (webApp) {
      webApp.BackButton.onClick(callback)
      webApp.BackButton.show()
    }
  }

  /**
   * Скрыть кнопку "Назад"
   */
  static hideBackButton() {
    const webApp = this.getWebApp()
    if (webApp) {
      webApp.BackButton.hide()
    }
  }

  /**
   * Показать главную кнопку
   */
  static showMainButton(text: string, callback: () => void) {
    const webApp = this.getWebApp()
    if (webApp) {
      webApp.MainButton.setText(text)
      webApp.MainButton.onClick(callback)
      webApp.MainButton.show()
    }
  }

  /**
   * Скрыть главную кнопку
   */
  static hideMainButton() {
    const webApp = this.getWebApp()
    if (webApp) {
      webApp.MainButton.hide()
    }
  }

  /**
   * Haptic feedback
   */
  static hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') {
    const webApp = this.getWebApp()
    if (webApp) {
      if (['light', 'medium', 'heavy'].includes(type)) {
        webApp.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy')
      } else if (['success', 'error', 'warning'].includes(type)) {
        webApp.HapticFeedback.notificationOccurred(type as 'success' | 'error' | 'warning')
      }
    }
  }

  /**
   * Закрыть Web App
   */
  static close() {
    const webApp = this.getWebApp()
    if (webApp) {
      webApp.close()
    }
  }

  /**
   * Получить цветовую схему
   */
  static getColorScheme(): 'light' | 'dark' {
    const webApp = this.getWebApp()
    return webApp?.colorScheme || 'light'
  }

  /**
   * Получить тему
   */
  static getThemeParams() {
    const webApp = this.getWebApp()
    return webApp?.themeParams || {}
  }
}

export default TelegramAuthService

