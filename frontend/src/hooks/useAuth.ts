import { useState, useEffect, useCallback } from 'react'
import { TelegramAuthService } from '@/services/telegramAuth'
import { useTelegramWebApp } from './useTelegramWebApp'

interface User {
  id: number
  telegramId: string
  firstName: string | null
  lastName: string | null
  username: string | null
  phone: string | null
  languageCode: string
  isPhoneVerified: boolean
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
}

export function useAuth() {
  const { isInTelegram, user: telegramUser } = useTelegramWebApp()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  })

  // Функция для авторизации
  const authenticate = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      // Проверяем, есть ли сохраненный токен
      const savedToken = TelegramAuthService.getAuthToken()
      const savedUser = TelegramAuthService.getSavedUser()

      if (savedToken && savedUser) {
        // Используем сохраненные данные
        console.log('✅ Using saved auth token')
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: savedUser,
          error: null,
        })
        return savedUser
      }

      // Если в Telegram, пытаемся авторизоваться
      if (isInTelegram && telegramUser) {
        console.log('🔐 Authenticating with Telegram...')
        const result = await TelegramAuthService.authenticate()
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: result.user,
          error: null,
        })
        return result.user
      } else {
        // Не в Telegram - используем моковые данные для разработки
        console.warn('⚠️ Not in Telegram, using mock auth for development')
        const mockUser: User = {
          id: 1,
          telegramId: '12345',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          phone: '+998901234567',
          languageCode: 'ru',
          isPhoneVerified: true,
        }
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: mockUser,
          error: null,
        })
        return mockUser
      }
    } catch (error) {
      console.error('❌ Authentication error:', error)
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : 'Authentication failed',
      })
      throw error
    }
  }, [isInTelegram, telegramUser])

  // Функция для выхода
  const logout = useCallback(async () => {
    try {
      await TelegramAuthService.logout()
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      })
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }, [])

  // Автоматическая авторизация при монтировании
  useEffect(() => {
    authenticate()
  }, [authenticate])

  return {
    ...authState,
    authenticate,
    logout,
  }
}

