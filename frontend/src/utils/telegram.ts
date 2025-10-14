/**
 * Утилиты для работы с Telegram WebApp
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string
        initDataUnsafe: any
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: any
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        isClosingConfirmationEnabled: boolean
        BackButton: any
        MainButton: any
        ready: () => void
        expand: () => void
        close: () => void
        [key: string]: any
      }
    }
  }
}

/**
 * Проверяет, запущено ли приложение в Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.Telegram !== 'undefined' && 
         typeof window.Telegram.WebApp !== 'undefined' &&
         window.Telegram.WebApp.initData !== ''
}

/**
 * Получает объект Telegram WebApp
 */
export function getTelegramWebApp() {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp!
  }
  return null
}

/**
 * Проверяет, поддерживаются ли JSONP запросы в текущей среде
 * В Telegram WebApp JSONP блокируется из-за Content Security Policy
 */
export function supportsJSONP(): boolean {
  // В Telegram WebApp JSONP не работает из-за CSP
  if (isTelegramWebApp()) {
    return false
  }
  
  // В обычном браузере JSONP работает
  return true
}

/**
 * Инициализирует Telegram WebApp
 */
export function initTelegramWebApp() {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.ready()
    webApp.expand()
  }
}

