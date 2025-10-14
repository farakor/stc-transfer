import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { useAuth } from '@/hooks/useAuth'
import { AppRoutes } from '@/components/AppRoutes'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function App() {
  const { webApp, isReady, user: telegramUser } = useTelegramWebApp()
  const { isAuthenticated, isLoading: isAuthLoading, user: authUser, error: authError } = useAuth()

  // Установка языка из URL теперь происходит в RootRedirect для правильной маршрутизации

  useEffect(() => {
    if (webApp && isReady) {
      // Configure Telegram Web App
      webApp.ready()
      webApp.expand()

      // Set main button
      webApp.MainButton.setText('Продолжить')
      webApp.MainButton.color = '#3b82f6'
      webApp.MainButton.textColor = '#ffffff'

      // Set header color
      webApp.setHeaderColor('#ffffff')

      // Enable closing confirmation
      webApp.enableClosingConfirmation()

      console.log('✅ Telegram Web App initialized', {
        telegramUser,
        authUser,
        isAuthenticated,
        platform: webApp.platform,
        version: webApp.version,
        themeParams: webApp.themeParams
      })
    }
  }, [webApp, isReady, telegramUser, authUser, isAuthenticated])

  // Показываем загрузку если приложение или авторизация не готовы
  if (!isReady || isAuthLoading) {
    return <LoadingScreen />
  }

  // Показываем ошибку авторизации, если есть
  if (authError && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-lg font-semibold mb-2">Ошибка авторизации</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen telegram-viewport safe-area-top safe-area-bottom">
          <AppRoutes />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
