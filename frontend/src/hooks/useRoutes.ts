import { useQuery, useMutation } from '@tanstack/react-query'
import { RouteService, PriceCalculationRequest } from '@/services/routeService'

// Query keys
export const routeKeys = {
  all: ['routes'] as const,
  active: () => [...routeKeys.all, 'active'] as const,
  popular: () => [...routeKeys.all, 'popular'] as const,
  search: (from: string, to: string) => [...routeKeys.all, 'search', from, to] as const,
  detail: (id: string) => [...routeKeys.all, 'detail', id] as const,
}

// Получить активные маршруты
export function useActiveRoutes() {
  return useQuery({
    queryKey: routeKeys.active(),
    queryFn: RouteService.getActiveRoutes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Получить популярные направления
export function usePopularDestinations() {
  return useQuery({
    queryKey: routeKeys.popular(),
    queryFn: RouteService.getPopularDestinations,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Поиск маршрутов
export function useSearchRoutes(from: string, to: string) {
  return useQuery({
    queryKey: routeKeys.search(from, to),
    queryFn: () => RouteService.searchRoutes(from, to),
    enabled: !!(from && to),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Получить маршрут по ID
export function useRouteDetail(id: string | null) {
  return useQuery({
    queryKey: routeKeys.detail(id!),
    queryFn: () => RouteService.getRouteById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

// Рассчитать стоимость поездки
export function useCalculatePrice() {
  return useMutation({
    mutationFn: (request: PriceCalculationRequest) =>
      RouteService.calculatePrice(request),
  })
}
