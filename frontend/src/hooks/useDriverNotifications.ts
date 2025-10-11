import { useState, useEffect, useCallback } from 'react';

interface Booking {
  id: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  createdAt: string;
}

interface NotificationHookReturn {
  hasNewBookings: boolean;
  newBookingsCount: number;
  playNotificationSound: () => void;
  clearNotifications: () => void;
  requestNotificationPermission: () => Promise<boolean>;
}

export const useDriverNotifications = (
  driverId: number | null,
  currentBookings: Booking[]
): NotificationHookReturn => {
  const [hasNewBookings, setHasNewBookings] = useState(false);
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [lastBookingCount, setLastBookingCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Запрос разрешения на уведомления
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Браузер не поддерживает уведомления');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      setNotificationPermission('denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Ошибка запроса разрешения на уведомления:', error);
      return false;
    }
  }, []);

  // Воспроизведение звука уведомления
  const playNotificationSound = useCallback(() => {
    try {
      // Создаем простой звуковой сигнал
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Ошибка воспроизведения звука:', error);
    }
  }, []);

  // Показ браузерного уведомления
  const showBrowserNotification = useCallback((booking: Booking) => {
    if (notificationPermission !== 'granted') return;

    try {
      const notification = new Notification('Новый заказ!', {
        body: `${booking.fromLocation} → ${booking.toLocation}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `booking-${booking.id}`,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'Посмотреть'
          }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Автоматически закрываем через 10 секунд
      setTimeout(() => {
        notification.close();
      }, 10000);
    } catch (error) {
      console.error('Ошибка показа уведомления:', error);
    }
  }, [notificationPermission]);

  // Отслеживание новых заказов
  useEffect(() => {
    const vehicleAssignedBookings = currentBookings.filter(
      booking => booking.status === 'VEHICLE_ASSIGNED'
    );
    
    const currentCount = vehicleAssignedBookings.length;

    if (lastBookingCount > 0 && currentCount > lastBookingCount) {
      const newBookings = currentCount - lastBookingCount;
      setHasNewBookings(true);
      setNewBookingsCount(newBookings);

      // Воспроизводим звук
      playNotificationSound();

      // Показываем браузерное уведомление для каждого нового заказа
      const newBookingsList = vehicleAssignedBookings.slice(-newBookings);
      newBookingsList.forEach(booking => {
        showBrowserNotification(booking);
      });

      // Вибрация на мобильных устройствах
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }

    setLastBookingCount(currentCount);
  }, [currentBookings, lastBookingCount, playNotificationSound, showBrowserNotification]);

  // Очистка уведомлений
  const clearNotifications = useCallback(() => {
    setHasNewBookings(false);
    setNewBookingsCount(0);
  }, []);

  // Инициализация разрешений при монтировании
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  return {
    hasNewBookings,
    newBookingsCount,
    playNotificationSound,
    clearNotifications,
    requestNotificationPermission
  };
};
