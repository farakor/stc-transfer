import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User, Vehicle, Booking, VehicleType, Language, PriceCalculation } from '@/types'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  language: Language

  // Booking flow state
  selectedVehicleType: VehicleType | null
  fromLocation: string
  toLocation: string
  pickupTime: string
  notes: string
  currentBooking: Booking | null
  priceCalculation: PriceCalculation | null

  // UI state
  isLoading: boolean
  error: string | null
  currentStep: number // For booking flow
  hasHydrated: boolean // Flag для проверки загрузки из localStorage

  // Actions
  setUser: (user: User | null) => void
  setLanguage: (language: Language) => void
  setSelectedVehicleType: (type: VehicleType | null) => void
  setFromLocation: (location: string) => void
  setToLocation: (location: string) => void
  setPickupTime: (time: string) => void
  setNotes: (notes: string) => void
  setCurrentBooking: (booking: Booking | null) => void
  setPriceCalculation: (calculation: PriceCalculation | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentStep: (step: number) => void
  setHasHydrated: (hasHydrated: boolean) => void
  resetBookingFlow: () => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        language: 'ru',

        selectedVehicleType: null,
        fromLocation: '',
        toLocation: '',
        pickupTime: '',
        notes: '',
        currentBooking: null,
        priceCalculation: null,

        isLoading: false,
        error: null,
        currentStep: 0,
        hasHydrated: false,

        // Actions
        setUser: (user) => {
          set({
            user,
            isAuthenticated: !!user
          }, false, 'setUser')
        },

        setLanguage: (language) => {
          set({ language }, false, 'setLanguage')
        },

        setSelectedVehicleType: (selectedVehicleType) => {
          set({ selectedVehicleType }, false, 'setSelectedVehicleType')
        },

        setFromLocation: (fromLocation) => {
          set({ fromLocation }, false, 'setFromLocation')
        },

        setToLocation: (toLocation) => {
          set({ toLocation }, false, 'setToLocation')
        },

        setPickupTime: (pickupTime) => {
          set({ pickupTime }, false, 'setPickupTime')
        },

        setNotes: (notes) => {
          set({ notes }, false, 'setNotes')
        },

        setCurrentBooking: (currentBooking) => {
          set({ currentBooking }, false, 'setCurrentBooking')
        },

        setPriceCalculation: (priceCalculation) => {
          set({ priceCalculation }, false, 'setPriceCalculation')
        },

        setLoading: (isLoading) => {
          set({ isLoading }, false, 'setLoading')
        },

        setError: (error) => {
          set({ error }, false, 'setError')
        },

      setCurrentStep: (currentStep) => {
        set({ currentStep }, false, 'setCurrentStep')
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated }, false, 'setHasHydrated')
      },

      resetBookingFlow: () => {
          set({
            selectedVehicleType: null,
            fromLocation: '',
            toLocation: '',
            pickupTime: '',
            notes: '',
            currentBooking: null,
            priceCalculation: null,
            currentStep: 0,
            error: null
          }, false, 'resetBookingFlow')
        },

        clearError: () => {
          set({ error: null }, false, 'clearError')
        }
      }),
      {
        name: 'stc-transfer-storage', // Имя для localStorage
        partialize: (state) => ({
          // Сохраняем только важные данные для восстановления состояния
          language: state.language,
          selectedVehicleType: state.selectedVehicleType,
          fromLocation: state.fromLocation,
          toLocation: state.toLocation,
          pickupTime: state.pickupTime,
          notes: state.notes,
          currentBooking: state.currentBooking,
          priceCalculation: state.priceCalculation,
          currentStep: state.currentStep,
          // Не сохраняем user, isLoading, error - они должны обновляться при каждой загрузке
        }),
        onRehydrateStorage: () => (state) => {
          // Устанавливаем флаг после успешной загрузки данных из localStorage
          state?.setHasHydrated(true)
        }
      }
    ),
    {
      name: 'stc-transfer-store'
    }
  )
)

// Selectors for easy access to computed state
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useLanguage = () => useAppStore((state) => state.language)
export const useHasHydrated = () => useAppStore((state) => state.hasHydrated)
export const useBookingFlow = () => useAppStore((state) => ({
  selectedVehicleType: state.selectedVehicleType,
  fromLocation: state.fromLocation,
  toLocation: state.toLocation,
  pickupTime: state.pickupTime,
  notes: state.notes,
  priceCalculation: state.priceCalculation,
  currentStep: state.currentStep
}))
export const useCurrentBooking = () => useAppStore((state) => state.currentBooking)
export const useLoading = () => useAppStore((state) => state.isLoading)
export const useError = () => useAppStore((state) => state.error)
