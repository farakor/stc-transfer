import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { VehicleService } from '@/services/vehicleService'
import { VehicleType } from '@/types'

// Query keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  types: () => [...vehicleKeys.all, 'types'] as const,
  available: () => [...vehicleKeys.all, 'available'] as const,
  byType: (type: VehicleType) => [...vehicleKeys.all, 'type', type] as const,
  detail: (id: string) => [...vehicleKeys.all, 'detail', id] as const,
}

// Получить типы автомобилей
export function useVehicleTypes() {
  return useQuery({
    queryKey: vehicleKeys.types(),
    queryFn: VehicleService.getVehicleTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Получить доступные автомобили
export function useAvailableVehicles() {
  return useQuery({
    queryKey: vehicleKeys.available(),
    queryFn: VehicleService.getAvailableVehicles,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Получить автомобили по типу
export function useVehiclesByType(type: VehicleType | null) {
  return useQuery({
    queryKey: vehicleKeys.byType(type!),
    queryFn: () => VehicleService.getVehiclesByType(type!),
    enabled: !!type,
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
  })
}

// Получить детали автомобиля
export function useVehicleDetail(id: string | null) {
  return useQuery({
    queryKey: vehicleKeys.detail(id!),
    queryFn: () => VehicleService.getVehicleById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}
