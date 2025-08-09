import { useEffect, useState } from 'react'

// Telegram WebApp types
interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    start_param?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean

  // Methods
  ready(): void
  expand(): void
  close(): void
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void

  // Main Button
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isProgressVisible: boolean
    isActive: boolean
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
  }

  // Back Button
  BackButton: {
    isVisible: boolean
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
  }

  // Haptic Feedback
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [user, setUser] = useState<TelegramWebApp['initDataUnsafe']['user'] | null>(null)

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp
      setWebApp(tgWebApp)
      setUser(tgWebApp.initDataUnsafe.user || null)
      setIsReady(true)

      console.log('🤖 Telegram WebApp detected:', {
        version: tgWebApp.version,
        platform: tgWebApp.platform,
        user: tgWebApp.initDataUnsafe.user,
        themeParams: tgWebApp.themeParams
      })
    } else {
      // For development/testing outside Telegram
      console.warn('⚠️ Telegram WebApp not detected, using mock data for development')

      // Mock Telegram WebApp for development
      const mockWebApp = {
        initData: '',
        initDataUnsafe: {
          user: {
            id: 12345,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'ru'
          }
        },
        version: '6.0',
        platform: 'web',
        colorScheme: 'light' as const,
        themeParams: {},
        isExpanded: false,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        headerColor: '#ffffff',
        backgroundColor: '#ffffff',
        isClosingConfirmationEnabled: false,

        ready: () => console.log('Mock WebApp ready'),
        expand: () => console.log('Mock WebApp expand'),
        close: () => console.log('Mock WebApp close'),
        enableClosingConfirmation: () => console.log('Mock WebApp enableClosingConfirmation'),
        disableClosingConfirmation: () => console.log('Mock WebApp disableClosingConfirmation'),
        setHeaderColor: (color: string) => console.log('Mock setHeaderColor:', color),
        setBackgroundColor: (color: string) => console.log('Mock setBackgroundColor:', color),

        MainButton: {
          text: '',
          color: '#3b82f6',
          textColor: '#ffffff',
          isVisible: false,
          isProgressVisible: false,
          isActive: true,
          setText: (text: string) => console.log('Mock MainButton setText:', text),
          onClick: (callback: () => void) => console.log('Mock MainButton onClick:', callback),
          offClick: (callback: () => void) => console.log('Mock MainButton offClick:', callback),
          show: () => console.log('Mock MainButton show'),
          hide: () => console.log('Mock MainButton hide'),
          enable: () => console.log('Mock MainButton enable'),
          disable: () => console.log('Mock MainButton disable'),
          showProgress: () => console.log('Mock MainButton showProgress'),
          hideProgress: () => console.log('Mock MainButton hideProgress'),
        },

        BackButton: {
          isVisible: false,
          onClick: (callback: () => void) => console.log('Mock BackButton onClick:', callback),
          offClick: (callback: () => void) => console.log('Mock BackButton offClick:', callback),
          show: () => console.log('Mock BackButton show'),
          hide: () => console.log('Mock BackButton hide'),
        },

        HapticFeedback: {
          impactOccurred: (style: string) => console.log('Mock HapticFeedback impactOccurred:', style),
          notificationOccurred: (type: string) => console.log('Mock HapticFeedback notificationOccurred:', type),
          selectionChanged: () => console.log('Mock HapticFeedback selectionChanged'),
        }
      } as TelegramWebApp

      setWebApp(mockWebApp)
      setUser(mockWebApp.initDataUnsafe.user || null)

      // Delay to simulate real app loading
      setTimeout(() => setIsReady(true), 500)
    }
  }, [])

  return {
    webApp,
    isReady,
    user,
    isInTelegram: !!window.Telegram?.WebApp
  }
}
