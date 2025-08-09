import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp'
import { AppRoutes } from '@/components/AppRoutes'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function App() {
  const { webApp, isReady, user } = useTelegramWebApp()

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
        user,
        platform: webApp.platform,
        version: webApp.version,
        themeParams: webApp.themeParams
      })
    }
  }, [webApp, isReady, user])

  if (!isReady) {
    return <LoadingScreen />
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
