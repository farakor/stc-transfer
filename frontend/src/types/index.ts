// User types
export interface User {
  id: string
  telegramId: number
  name?: string
  phone?: string
  language: 'ru' | 'en' | 'uz'
  createdAt: string
  updatedAt: string
}

// Vehicle types
export enum VehicleType {
  SEDAN = 'SEDAN',
  PREMIUM = 'PREMIUM',
  MINIVAN = 'MINIVAN',
  MICROBUS = 'MICROBUS',
  BUS = 'BUS'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE'
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  type: VehicleType
  capacity: number
  baggageCapacity: number
  licensePlate: string
  status: VehicleStatus
  createdAt: string
  updatedAt: string
  driver?: Driver
  pricing: Pricing[]
}

// Driver types
export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

export interface Driver {
  id: string
  name: string
  phone: string
  vehicleId: string
  status: DriverStatus
  createdAt: string
  updatedAt: string
  vehicle: Vehicle
}

// Route types
export enum RouteType {
  FIXED = 'FIXED',
  PER_KM = 'PER_KM',
  HOURLY = 'HOURLY'
}

export interface Route {
  id: string
  name: string
  fromLocation: string
  toLocation: string
  distanceKm?: number
  routeType: RouteType
  isActive: boolean
  createdAt: string
  updatedAt: string
  pricing: Pricing[]
}

// Pricing types
export interface Pricing {
  id: string
  routeId: string
  vehicleId: string
  fixedPrice?: number
  pricePerKm?: number
  pricePerHourWait?: number
  createdAt: string
  updatedAt: string
  route: Route
  vehicle: Vehicle
}

// Booking types
export enum BookingStatus {
  PENDING = 'PENDING',
  VEHICLE_ASSIGNED = 'VEHICLE_ASSIGNED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Booking {
  id: string
  bookingNumber: string // Номер заказа в формате СТТ-00001
  userId: string
  vehicleId?: string
  driverId?: string
  routeId?: string
  fromLocation: string
  toLocation: string
  routeType: RouteType
  distanceKm?: number
  price: number
  status: BookingStatus
  pickupTime?: string
  notes?: string
  vehicleType?: VehicleType // Тип автомобиля, выбранный клиентом
  createdAt: string
  updatedAt: string
  user: User
  vehicle?: Vehicle
  driver?: Driver
  route?: Route
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form types
export interface BookingFormData {
  fromLocation: string
  toLocation: string
  pickupTime?: string
  notes?: string
  vehicleType: VehicleType
  routeType?: RouteType
  distanceKm?: number
}

export interface UserFormData {
  name: string
  phone: string
  language: 'ru' | 'en' | 'uz'
}

// Language types
export type Language = 'ru' | 'en' | 'uz'

export interface LanguageOption {
  code: Language
  name: string
  flag: string
}

// App state types
export interface AppState {
  user: User | null
  language: Language
  selectedVehicle: Vehicle | null
  currentBooking: Booking | null
  isLoading: boolean
  error: string | null
}

// Vehicle card display data
export interface VehicleDisplayData {
  type: VehicleType
  name: string
  description?: string
  capacity: number
  baggageCapacity: number
  features: string[]
  imageUrl?: string
  pricePerKm: number
  basePrice?: number
  availableCount?: number // Количество доступных машин
  totalCount?: number // Общее количество машин этого названия
}

// Popular destinations
export interface PopularDestination {
  id: string
  name: string
  nameEn: string
  nameUz: string
  type: 'airport' | 'station' | 'city' | 'landmark'
  icon: string
  price?: number
}

// Price calculation result
export interface PriceCalculation {
  vehicleType: VehicleType
  routeType: RouteType
  basePrice: number
  distance?: number
  pricePerKm?: number
  hours?: number // для почасовой оплаты
  waitingPrice?: number
  totalPrice: number
  currency: string
  breakdown: {
    label: string
    amount: number
  }[]
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: {
    label: string
    action: () => void
  }[]
}

// Map location types
export interface Location {
  lat: number
  lng: number
  address: string
  name?: string
}
