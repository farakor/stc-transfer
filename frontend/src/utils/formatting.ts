import { VehicleType } from '@/types'

// Форматирование цены
export function formatPrice(price: number, currency = 'UZS'): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(price)

  switch (currency) {
    case 'UZS':
      return `${formatted} сум`
    case 'USD':
      return `$${formatted}`
    default:
      return `${formatted} ${currency}`
  }
}

// Форматирование даты и времени
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Форматирование даты
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Форматирование времени
export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Получить название типа транспорта
export function getVehicleTypeName(type: VehicleType): string {
  switch (type) {
    case VehicleType.SEDAN:
      return 'Седан'
    case VehicleType.PREMIUM:
      return 'Премиум'
    case VehicleType.MINIVAN:
      return 'Минивэн'
    case VehicleType.MICROBUS:
      return 'Микроавтобус'
    case VehicleType.BUS:
      return 'Автобус'
    default:
      return 'Неизвестно'
  }
}

// Получить описание типа транспорта
export function getVehicleTypeDescription(type: VehicleType): string {
  switch (type) {
    case VehicleType.SEDAN:
      return 'Комфортный седан для 3 пассажиров'
    case VehicleType.PREMIUM:
      return 'Премиум автомобиль для VIP поездок'
    case VehicleType.MINIVAN:
      return 'Просторный минивэн для семей и групп'
    case VehicleType.MICROBUS:
      return 'Большой автобус для групповых поездок'
    case VehicleType.BUS:
      return 'Комфортабельный автобус для больших групп'
    default:
      return ''
  }
}

// Получить иконку типа транспорта
export function getVehicleTypeIcon(type: VehicleType): string {
  switch (type) {
    case VehicleType.SEDAN:
      return '🚗'
    case VehicleType.PREMIUM:
      return '🏎️'
    case VehicleType.MINIVAN:
      return '🚐'
    case VehicleType.MICROBUS:
      return '🚌'
    case VehicleType.BUS:
      return '🚌'
    default:
      return '🚗'
  }
}

// Получить изображение автомобиля по бренду и модели (возвращает null если нет изображения)
export function getVehicleImage(brand?: string, model?: string): string | null {
  if (!brand || !model) return null

  // Обрабатываем полные названия транспорта
  const fullName = `${brand} ${model}`.toLowerCase()

  // Проверяем полные названия
  if (fullName.includes('hongqi ehs 5') || fullName.includes('hongqi ehs5') || fullName.includes('hongqi ehs eq5')) {
    return new URL('../assets/eqm5_black.png', import.meta.url).href
  }
  if (fullName.includes('hongqi ehs 9') || fullName.includes('hongqi ehs9') || fullName.includes('hongqi ehs eq9')) {
    return new URL('../assets/ehs9.png', import.meta.url).href
  }
  if (fullName.includes('kia carnival')) {
    return new URL('../assets/carnival-kia-black-30.png', import.meta.url).href
  }
  if (fullName.includes('mercedes') && fullName.includes('sprinter')) {
    return new URL('../assets/mercedes-benz-sprinter.png', import.meta.url).href
  }
  if (fullName.includes('higer') || fullName.includes('автобус higer')) {
    return new URL('../assets/higer-bus.png', import.meta.url).href
  }

  // Fallback к старому методу для совместимости
  const brandModel = `${brand.toLowerCase()}_${model.toLowerCase().replace(/\s+/g, '')}`
  switch (brandModel) {
    case 'hongqi_ehs5':
      return new URL('../assets/eqm5_black.png', import.meta.url).href
    case 'hongqi_ehs9':
      return new URL('../assets/ehs9.png', import.meta.url).href
    case 'kia_carnival':
      return new URL('../assets/carnival-kia-black-30.png', import.meta.url).href
    case 'mercedes-benz_sprinter':
      return new URL('../assets/mercedes-benz-sprinter.png', import.meta.url).href
    case 'higer_bus':
      return new URL('../assets/higer-bus.png', import.meta.url).href
    default:
      return null
  }
}

// Получить компонент иконки или изображения для автомобиля
export function getVehicleDisplayElement(type: VehicleType, brand?: string, model?: string): { type: 'emoji' | 'image', content: string } {
  const image = getVehicleImage(brand, model)

  if (image) {
    return { type: 'image', content: image }
  }

  return { type: 'emoji', content: getVehicleTypeIcon(type) }
}

// Получить представительную модель для типа автомобиля
export function getRepresentativeVehicle(type: VehicleType): { brand: string, model: string } {
  switch (type) {
    case VehicleType.SEDAN:
      return { brand: 'Hongqi', model: 'EHS 5' }
    case VehicleType.PREMIUM:
      return { brand: 'Hongqi', model: 'EHS 9' }
    case VehicleType.MINIVAN:
      return { brand: 'KIA', model: 'Carnival' }
    case VehicleType.MICROBUS:
      return { brand: 'Mercedes-Benz', model: 'Sprinter' }
    case VehicleType.BUS:
      return { brand: 'Higer', model: 'Bus' }
    default:
      return { brand: '', model: '' }
  }
}

// Получить полное название автомобиля для типа
export function getVehicleModelName(type: VehicleType): string {
  switch (type) {
    case VehicleType.SEDAN:
      return 'Электромобиль Hongqi EHS 5'
    case VehicleType.PREMIUM:
      return 'Электромобиль Hongqi EHS 9'
    case VehicleType.MINIVAN:
      return 'KIA Carnival'
    case VehicleType.MICROBUS:
      return 'Mercedes-Benz Sprinter'
    case VehicleType.BUS:
      return 'Автобус Higer'
    default:
      return getVehicleTypeName(type)
  }
}

// Получить цвет для статуса заказа
export function getBookingStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-50'
    case 'VEHICLE_ASSIGNED':
      return 'text-orange-600 bg-orange-50'
    case 'CONFIRMED':
      return 'text-blue-600 bg-blue-50'
    case 'IN_PROGRESS':
      return 'text-purple-600 bg-purple-50'
    case 'COMPLETED':
      return 'text-green-600 bg-green-50'
    case 'CANCELLED':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Получить название статуса заказа
export function getBookingStatusName(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Ожидает подтверждения'
    case 'VEHICLE_ASSIGNED':
      return 'Машина назначена'
    case 'CONFIRMED':
      return 'Подтвержден'
    case 'IN_PROGRESS':
      return 'В пути'
    case 'COMPLETED':
      return 'Завершен'
    case 'CANCELLED':
      return 'Отменен'
    default:
      return 'Неизвестно'
  }
}

// Сокращение текста
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}

// Проверка телефонного номера
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Форматирование телефонного номера
export function formatPhoneNumber(phone: string): string {
  // Удаляем все нецифровые символы кроме +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Если номер начинается с +998 (Узбекистан)
  if (cleaned.startsWith('+998')) {
    const number = cleaned.slice(4)
    if (number.length === 9) {
      return `+998 (${number.slice(0, 2)}) ${number.slice(2, 5)} ${number.slice(5, 7)} ${number.slice(7)}`
    }
  }

  return cleaned
}

// Получить инициалы из имени
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// Проверка пустой строки
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0
}

// Капитализация первой буквы
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Проверка, является ли поездка по Самарканду
export function isSamarkandTrip(toLocation: string): boolean {
  return toLocation === 'Поездка по Самарканду'
}

// Форматирование цены с учетом особенностей поездки по Самарканду
export function formatTripPrice(price: number, toLocation: string, currency = 'UZS'): string {
  if (isSamarkandTrip(toLocation)) {
    return 'Сумма вычисляется после окончания поездки'
  }
  return formatPrice(price, currency)
}

// Получить тарифы для поездок по Самарканду (теперь будет получать из API)
// Эта функция оставлена для обратной совместимости, но рекомендуется использовать API
export function getSamarkandTariffs(vehicleType: string): { perKm: number; hourly: number } {
  // Fallback значения если API недоступен
  const fallbackTariffs: Record<string, { perKm: number; hourly: number }> = {
    'SEDAN': { perKm: 15000, hourly: 150000 },
    'PREMIUM': { perKm: 40000, hourly: 400000 },
    'BUS': { perKm: 0, hourly: 325000 },
    'MICROBUS': { perKm: 25000, hourly: 200000 },
    'MINIVAN': { perKm: 20000, hourly: 180000 },
  }

  return fallbackTariffs[vehicleType] || { perKm: 0, hourly: 0 }
}
