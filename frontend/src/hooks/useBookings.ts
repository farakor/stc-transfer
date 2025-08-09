import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookingService, CreateBookingRequest } from '@/services/bookingService'
import { useAppStore } from '@/services/store'
import { useTelegramWebApp } from './useTelegramWebApp'

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  user: (telegramId: number) => [...bookingKeys.all, 'user', telegramId] as const,
  active: () => [...bookingKeys.all, 'active'] as const,
  stats: (period?: string) => [...bookingKeys.all, 'stats', period] as const,
}

// Получить заказ по ID
export function useBookingDetail(id: string | null) {
  return useQuery({
    queryKey: bookingKeys.detail(id!),
    queryFn: () => BookingService.getBookingById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// Получить заказы пользователя
export function useUserBookings(limit?: number) {
  const { user } = useTelegramWebApp()

  return useQuery({
    queryKey: bookingKeys.user(user?.id || 0),
    queryFn: () => BookingService.getUserBookings(user?.id || 0, limit),
    enabled: !!user?.id,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}

// Создать заказ
export function useCreateBooking() {
  const queryClient = useQueryClient()
  const { user } = useTelegramWebApp()
  const { setCurrentBooking, setLoading, setError } = useAppStore()

  return useMutation({
    mutationFn: (request: CreateBookingRequest) => {
      console.log('🚀 Creating booking via hook with request:', request)
      return BookingService.createBooking(request)
    },
    onMutate: () => {
      setLoading(true)
      setError(null)
    },
    onSuccess: (booking, variables) => {
      setCurrentBooking(booking)
      setLoading(false)

      // Invalidate user bookings to refresh the list
      if (variables.telegramId) {
        queryClient.invalidateQueries({
          queryKey: bookingKeys.user(variables.telegramId)
        })
      }

      // Invalidate active bookings for admin
      queryClient.invalidateQueries({
        queryKey: bookingKeys.active()
      })
    },
    onError: (error) => {
      setLoading(false)
      setError(error.message || 'Failed to create booking')
    }
  })
}

// Обновить статус заказа
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      BookingService.updateBookingStatus(id, status, notes),
    onSuccess: (booking) => {
      // Update the booking detail cache
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking)

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: bookingKeys.active()
      })
    }
  })
}

// Получить активные заказы (для админки)
export function useActiveBookings() {
  return useQuery({
    queryKey: bookingKeys.active(),
    queryFn: BookingService.getActiveBookings,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
  })
}

// Получить статистику заказов
export function useBookingStats(period?: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: bookingKeys.stats(period),
    queryFn: () => BookingService.getBookingStats(period),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
