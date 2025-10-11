import { Routes, Route, Navigate } from 'react-router-dom'
import { LanguageSelection } from '@/pages/LanguageSelection'
import { VehicleSelection } from '@/pages/VehicleSelection'
import { RouteSelection } from '@/pages/RouteSelection'
import { BookingForm } from '@/pages/BookingForm'
import { BookingConfirmation } from '@/pages/BookingConfirmation'
import { BookingStatus } from '@/pages/BookingStatus'
import TrackingPage from '@/pages/TrackingPage'
import AdminApp from '@/pages/admin/AdminApp'
import DriverApp from '@/pages/DriverApp'
import DriverLogin from '@/pages/driver/DriverLogin'
import DriverDashboard from '@/pages/driver/DriverDashboard'

export function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to language selection */}
      <Route path="/" element={<Navigate to="/language" replace />} />

      {/* Admin panel routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminApp page="dashboard" />} />
      <Route path="/admin/bookings" element={<AdminApp page="bookings" />} />
      <Route path="/admin/drivers" element={<AdminApp page="drivers" />} />
      <Route path="/admin/vehicles" element={<AdminApp page="vehicles" />} />
      <Route path="/admin/users" element={<AdminApp page="users" />} />
      <Route path="/admin/tariffs" element={<AdminApp page="tariffs" />} />
      <Route path="/admin/settings" element={<AdminApp page="settings" />} />

      {/* Driver app routes */}
      <Route path="/driver" element={<Navigate to="/driver/login" replace />} />
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/driver/dashboard" element={<DriverDashboard />} />
      <Route path="/driver/telegram" element={<DriverApp />} />

      {/* Main booking flow */}
      <Route path="/language" element={<LanguageSelection />} />
      <Route path="/vehicles" element={<VehicleSelection />} />
      <Route path="/route" element={<RouteSelection />} />
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/confirmation" element={<BookingConfirmation />} />
      <Route path="/status/:bookingId" element={<BookingStatus />} />
      <Route path="/tracking/:bookingId" element={<TrackingPage />} />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/language" replace />} />
    </Routes>
  )
}
