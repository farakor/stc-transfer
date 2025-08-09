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
    default:
      return '🚗'
  }
}

// Получить цвет для статуса заказа
export function getBookingStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-50'
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
    case 'CONFIRMED':
      return 'Подтвержден'
    case 'IN_PROGRESS':
      return 'Выполняется'
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
