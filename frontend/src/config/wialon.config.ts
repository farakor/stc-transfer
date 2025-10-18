/**
 * Конфигурация для подключения к Wialon API
 * 
 * Поддерживает несколько методов подключения:
 * 1. Через CORS-прокси (рекомендуется) - обходит CORS ограничения
 * 2. Через JSONP - альтернативный метод обхода CORS
 * 3. Прямое подключение - если CORS настроен на сервере
 */

import { WialonConfig } from '../services/wialonJsonpService';

// Конфигурация для реального подключения к Wialon
// Используем JSONP подключение для обхода CORS ограничений
export const wialonConfig: WialonConfig = {
  // URL вашего сервера Wialon (gps.ent-en.com через JSONP)
  // Используем HTTPS для production, чтобы избежать Mixed Content ошибок
  baseUrl: 'https://gps.ent-en.com/wialon',

  // Токен доступа к API (72-символьный токен, работает через JSONP)
  token: '85991e5f06896e98fe3c0bd49d2fe6d825770468546E156C3088DF44EB44163B2A478841',

  // Логин и пароль (резервный вариант, если токен не работает)
  // username: 'AKhamraev',
  // password: 'xamrayev11'
};

// Настройки по умолчанию
export const defaultMapSettings = {
  // Центр карты по умолчанию (Ташкент)
  defaultCenter: [41.2995, 69.2401] as [number, number],

  // Масштаб по умолчанию
  defaultZoom: 11,

  // Интервал обновления данных (в секундах)
  refreshInterval: 30,

  // Максимальное время без обновления для статуса "оффлайн" (в секундах)
  offlineTimeout: 600, // 10 минут

  // Минимальная скорость для статуса "движется" (км/ч)
  movingSpeedThreshold: 5
};

// Настройки для демо-режима
export const demoSettings = {
  // Включить демо-режим по умолчанию (если нет конфигурации Wialon)
  enableDemoMode: true,

  // Количество демо-транспортных средств
  demoVehicleCount: 4,

  // Область для генерации случайных позиций (границы Ташкента)
  demoBounds: {
    north: 41.35,
    south: 41.25,
    east: 69.35,
    west: 69.15
  }
};

// Стили для маркеров транспорта
export const vehicleMarkerStyles = {
  moving: {
    color: '#10B981', // зеленый
    label: 'В движении'
  },
  stopped: {
    color: '#F59E0B', // желтый
    label: 'Остановка'
  },
  offline: {
    color: '#EF4444', // красный
    label: 'Оффлайн'
  },
  online: {
    color: '#3B82F6', // синий
    label: 'Онлайн'
  }
};

// Настройки уведомлений
export const notificationSettings = {
  // Показывать уведомления о статусе подключения
  showConnectionStatus: true,

  // Показывать уведомления об ошибках
  showErrorNotifications: true,

  // Автоматически переключаться на демо-режим при ошибках
  fallbackToDemoMode: true
};

// Настройки подключения
export const connectionSettings = {
  // Предпочитаемый метод подключения
  preferredMethod: 'proxy' as 'proxy' | 'jsonp' | 'direct',

  // Таймаут для запросов (в миллисекундах)
  requestTimeout: 30000,

  // Количество попыток переподключения
  retryAttempts: 3,

  // Интервал между попытками (в миллисекундах)
  retryInterval: 5000
};