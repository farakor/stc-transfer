import { Routes, Route, Navigate } from 'react-router-dom'
import { LanguageSelection } from '@/pages/LanguageSelection'
import { VehicleSelection } from '@/pages/VehicleSelection'
import { RouteSelection } from '@/pages/RouteSelection'
import { BookingForm } from '@/pages/BookingForm'
import { BookingConfirmation } from '@/pages/BookingConfirmation'
import { BookingStatus } from '@/pages/BookingStatus'
import AdminApp from '@/pages/admin/AdminApp'

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
      <Route path="/admin/settings" element={<AdminApp page="settings" />} />

      {/* Main booking flow */}
      <Route path="/language" element={<LanguageSelection />} />
      <Route path="/vehicles" element={<VehicleSelection />} />
      <Route path="/route" element={<RouteSelection />} />
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/confirmation" element={<BookingConfirmation />} />
      <Route path="/status/:bookingId" element={<BookingStatus />} />

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/language" replace />} />
    </Routes>
  )
}
