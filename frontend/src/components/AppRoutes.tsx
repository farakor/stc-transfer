import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/services/store'
import { Language } from '@/types'
import { VehicleSelection } from '@/pages/VehicleSelection'
import { RouteSelection } from '@/pages/RouteSelection'
import { BookingForm } from '@/pages/BookingForm'
import { BookingConfirmation } from '@/pages/BookingConfirmation'
import { BookingStatus } from '@/pages/BookingStatus'
import TrackingPage from '@/pages/TrackingPage'
import AdminApp from '@/pages/admin/AdminApp'
import AdminLogin from '@/pages/admin/AdminLogin'
import DriverApp from '@/pages/DriverApp'
import DriverLogin from '@/pages/driver/DriverLogin'
import DriverDashboard from '@/pages/driver/DriverDashboard'
import DriverTelegramAuth from '@/pages/driver/DriverTelegramAuth'
import { ClientDashboard } from '@/pages/client/ClientDashboard'
import { BookingHistory } from '@/pages/client/BookingHistory'
import { Support } from '@/pages/client/Support'
import { Tariffs } from '@/pages/client/Tariffs'

function RootRedirect() {
  const location = useLocation()
  const { setLanguage } = useAppStore()
  const [isLanguageSet, setIsLanguageSet] = useState(false)
  
  // Проверяем, есть ли язык в URL
  const urlParams = new URLSearchParams(location.search)
  const langParam = urlParams.get('lang')
  const storedLang = localStorage.getItem('language')
  
  // Устанавливаем язык из URL, localStorage или по умолчанию 'ru'
  useEffect(() => {
    if (langParam && ['ru', 'en', 'uz'].includes(langParam)) {
      setLanguage(langParam as Language)
      localStorage.setItem('language', langParam)
      console.log('✅ Language set from URL:', langParam)
    } else if (storedLang && ['ru', 'en', 'uz'].includes(storedLang)) {
      setLanguage(storedLang as Language)
      console.log('✅ Language set from localStorage:', storedLang)
    } else {
      // Устанавливаем русский язык по умолчанию
      setLanguage('ru')
      localStorage.setItem('language', 'ru')
      console.log('✅ Language set to default: ru')
    }
    setIsLanguageSet(true)
  }, [langParam, storedLang, setLanguage])
  
  // Ждем установки языка перед перенаправлением
  if (!isLanguageSet) {
    return null
  }
  
  // Перенаправляем на клиентский дашборд
  console.log('✅ Redirecting to /client/dashboard')
  return <Navigate to="/client/dashboard" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root based on language availability */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin panel routes */}
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminApp page="dashboard" />} />
      <Route path="/admin/bookings" element={<AdminApp page="bookings" />} />
      <Route path="/admin/drivers" element={<AdminApp page="drivers" />} />
      <Route path="/admin/vehicles" element={<AdminApp page="vehicles" />} />
      <Route path="/admin/users" element={<AdminApp page="users" />} />
      <Route path="/admin/tariffs" element={<AdminApp page="tariffs" />} />
      <Route path="/admin/admins" element={<AdminApp page="admins" />} />
      <Route path="/admin/settings" element={<AdminApp page="settings" />} />

      {/* Driver app routes */}
      <Route path="/driver" element={<Navigate to="/driver/auth" replace />} />
      <Route path="/driver/auth" element={<DriverTelegramAuth />} />
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/driver/dashboard" element={<DriverDashboard />} />
      <Route path="/driver/telegram" element={<DriverApp />} />

      {/* Client dashboard routes */}
      <Route path="/client/dashboard" element={<ClientDashboard />} />
      <Route path="/client/history" element={<BookingHistory />} />
      <Route path="/client/support" element={<Support />} />
      <Route path="/client/tariffs" element={<Tariffs />} />

      {/* Main booking flow */}
      <Route path="/vehicles" element={<VehicleSelection />} />
      <Route path="/route" element={<RouteSelection />} />
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/confirmation" element={<BookingConfirmation />} />
      <Route path="/status/:bookingId" element={<BookingStatus />} />
      <Route path="/tracking/:bookingId" element={<TrackingPage />} />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
    </Routes>
  )
}
