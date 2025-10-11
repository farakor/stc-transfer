import { useQuery } from '@tanstack/react-query'
import { TariffService } from '@/services/tariffService'
import { VehicleType } from '@/types'

// Query keys
export const tariffKeys = {
  all: ['tariffs'] as const,
  matrix: () => [...tariffKeys.all, 'matrix'] as const,
  list: () => [...tariffKeys.all, 'list'] as const,
  vehicleModels: () => [...tariffKeys.all, 'vehicle-models'] as const,
  samarkandTariffs: (vehicleType: string) => [...tariffKeys.all, 'samarkand', vehicleType] as const,
  routeTariff: (from: string, to: string, vehicleType: VehicleType) => 
    [...tariffKeys.all, 'route', from, to, vehicleType] as const,
}

// Получить матрицу тарифов
export function useTariffMatrix() {
  return useQuery({
    queryKey: tariffKeys.matrix(),
    queryFn: TariffService.getTariffMatrix,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Получить все тарифы
export function useTariffs() {
  return useQuery({
    queryKey: tariffKeys.list(),
    queryFn: TariffService.getTariffs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Получить модели автомобилей
export function useVehicleModels() {
  return useQuery({
    queryKey: tariffKeys.vehicleModels(),
    queryFn: TariffService.getVehicleModels,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Получить тарифы для поездок по Самарканду
export function useSamarkandTariffs(vehicleType: string) {
  return useQuery({
    queryKey: tariffKeys.samarkandTariffs(vehicleType),
    queryFn: () => TariffService.getSamarkandTariffs(vehicleType),
    enabled: !!vehicleType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Получить тариф для конкретного маршрута
export function useRouteTariff(fromLocation: string, toLocation: string, vehicleType: VehicleType | null) {
  return useQuery({
    queryKey: tariffKeys.routeTariff(fromLocation, toLocation, vehicleType!),
    queryFn: () => TariffService.getTariffForRoute(fromLocation, toLocation, vehicleType!),
    enabled: !!(fromLocation && toLocation && vehicleType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
