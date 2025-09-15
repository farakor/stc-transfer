import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Edit,
  X,
  Plus
} from 'lucide-react';

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettings {
  telegramBotToken: string;
  dispatcherChatId: string;
  newOrderNotifications: boolean;
  statusUpdateNotifications: boolean;
  driverAssignmentNotifications: boolean;
  customerNotifications: boolean;
  systemAlerts: boolean;
}

interface GeneralSettings {
  companyName: string;
  supportPhone: string;
  supportEmail: string;
  defaultLanguage: string;
  timezone: string;
  currency: string;
  workingHours: {
    start: string;
    end: string;
  };
  maxAdvanceBookingDays: number;
}

const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'general'>('notifications');
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Настройки уведомлений
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    telegramBotToken: '',
    dispatcherChatId: '',
    newOrderNotifications: true,
    statusUpdateNotifications: true,
    driverAssignmentNotifications: true,
    customerNotifications: true,
    systemAlerts: true
  });

  // Общие настройки
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    companyName: 'STC Transfer',
    supportPhone: '+998 90 123 45 67',
    supportEmail: 'support@stctransfer.uz',
    defaultLanguage: 'ru',
    timezone: 'Asia/Tashkent',
    currency: 'UZS',
    workingHours: {
      start: '06:00',
      end: '22:00'
    },
    maxAdvanceBookingDays: 30
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ Загружаем настройки системы...');

      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      console.log('📦 Получены настройки:', data);

      if (data.success) {
        const groupedSettings = data.data;

        // Парсим настройки по категориям
        if (groupedSettings.tariffs) {
          const tariffs = { ...tariffSettings };
          groupedSettings.tariffs.forEach((setting: any) => {
            if (setting.key === 'basePrice') tariffs.basePrice = setting.parsedValue;
            else if (setting.key === 'minPrice') tariffs.minPrice = setting.parsedValue;
            else if (setting.key === 'perKmRates') tariffs.perKmRates = setting.parsedValue;
            else if (setting.key === 'nightSurcharge') tariffs.nightSurcharge = setting.parsedValue;
            else if (setting.key === 'holidaySurcharge') tariffs.holidaySurcharge = setting.parsedValue;
            else if (setting.key === 'waitingTimeRate') tariffs.waitingTimeRate = setting.parsedValue;
          });
          setTariffSettings(tariffs);
        }

        if (groupedSettings.notifications) {
          const notifications = { ...notificationSettings };
          groupedSettings.notifications.forEach((setting: any) => {
            if (setting.key === 'telegramBotToken') notifications.telegramBotToken = setting.parsedValue;
            else if (setting.key === 'dispatcherChatId') notifications.dispatcherChatId = setting.parsedValue;
            else if (setting.key === 'newOrderNotifications') notifications.newOrderNotifications = setting.parsedValue;
            else if (setting.key === 'statusUpdateNotifications') notifications.statusUpdateNotifications = setting.parsedValue;
            else if (setting.key === 'driverAssignmentNotifications') notifications.driverAssignmentNotifications = setting.parsedValue;
            else if (setting.key === 'customerNotifications') notifications.customerNotifications = setting.parsedValue;
            else if (setting.key === 'systemAlerts') notifications.systemAlerts = setting.parsedValue;
          });
          setNotificationSettings(notifications);
        }

        if (groupedSettings.general) {
          const general = { ...generalSettings };
          groupedSettings.general.forEach((setting: any) => {
            if (setting.key === 'companyName') general.companyName = setting.parsedValue;
            else if (setting.key === 'supportPhone') general.supportPhone = setting.parsedValue;
            else if (setting.key === 'supportEmail') general.supportEmail = setting.parsedValue;
            else if (setting.key === 'defaultLanguage') general.defaultLanguage = setting.parsedValue;
            else if (setting.key === 'timezone') general.timezone = setting.parsedValue;
            else if (setting.key === 'currency') general.currency = setting.parsedValue;
            else if (setting.key === 'workingHours') general.workingHours = setting.parsedValue;
            else if (setting.key === 'maxAdvanceBookingDays') general.maxAdvanceBookingDays = setting.parsedValue;
          });
          setGeneralSettings(general);
        }

        console.log('✅ Настройки загружены из API');
      } else {
        console.error('❌ API вернул ошибку:', data.error);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseSettings = (settingsArray: SystemSetting[]) => {
    // Парсинг настроек из массива в структурированные объекты
    const notifications = { ...notificationSettings };
    const general = { ...generalSettings };

    settingsArray.forEach(setting => {
      const value = setting.type === 'NUMBER' ? parseFloat(setting.value) :
        setting.type === 'BOOLEAN' ? setting.value === 'true' :
          setting.type === 'JSON' ? JSON.parse(setting.value) :
            setting.value;

      // Распределяем по категориям
      if (setting.category === 'notifications') {
        if (setting.key in notifications) {
          (notifications as any)[setting.key] = value;
        }
      } else if (setting.category === 'general') {
        if (setting.key in general) {
          (general as any)[setting.key] = value;
        }
      }
    });

    setNotificationSettings(notifications);
    setGeneralSettings(general);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      console.log('💾 Сохраняем настройки...');

      // Формируем массив настроек для отправки
      const settingsToSave = [
        // Уведомления
        { key: 'telegramBotToken', value: notificationSettings.telegramBotToken, type: 'STRING', category: 'notifications' },
        { key: 'dispatcherChatId', value: notificationSettings.dispatcherChatId, type: 'STRING', category: 'notifications' },
        { key: 'newOrderNotifications', value: notificationSettings.newOrderNotifications.toString(), type: 'BOOLEAN', category: 'notifications' },
        { key: 'statusUpdateNotifications', value: notificationSettings.statusUpdateNotifications.toString(), type: 'BOOLEAN', category: 'notifications' },
        { key: 'driverAssignmentNotifications', value: notificationSettings.driverAssignmentNotifications.toString(), type: 'BOOLEAN', category: 'notifications' },
        { key: 'customerNotifications', value: notificationSettings.customerNotifications.toString(), type: 'BOOLEAN', category: 'notifications' },
        { key: 'systemAlerts', value: notificationSettings.systemAlerts.toString(), type: 'BOOLEAN', category: 'notifications' },

        // Общие настройки
        { key: 'companyName', value: generalSettings.companyName, type: 'STRING', category: 'general' },
        { key: 'supportPhone', value: generalSettings.supportPhone, type: 'STRING', category: 'general' },
        { key: 'supportEmail', value: generalSettings.supportEmail, type: 'STRING', category: 'general' },
        { key: 'defaultLanguage', value: generalSettings.defaultLanguage, type: 'STRING', category: 'general' },
        { key: 'timezone', value: generalSettings.timezone, type: 'STRING', category: 'general' },
        { key: 'currency', value: generalSettings.currency, type: 'STRING', category: 'general' },
        { key: 'workingHours', value: JSON.stringify(generalSettings.workingHours), type: 'JSON', category: 'general' },
        { key: 'maxAdvanceBookingDays', value: generalSettings.maxAdvanceBookingDays.toString(), type: 'NUMBER', category: 'general' }
      ];

      console.log('📋 Настройки для сохранения:', settingsToSave);

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave })
      });

      const data = await response.json();
      console.log('📦 Ответ от API сохранения:', data);

      if (data.success) {
        console.log('✅ Настройки сохранены через API');
        setHasChanges(false);
        alert('✅ Настройки успешно сохранены!');
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения настроек:', error);
      alert('❌ Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };


  const handleNotificationChange = (key: keyof NotificationSettings, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleGeneralChange = (key: keyof GeneralSettings, value: any) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
          <p className="text-gray-600 mt-1">Управление тарифами, уведомлениями и общими настройками</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>

      {/* Уведомление об изменениях */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Есть несохраненные изменения</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Не забудьте сохранить изменения, чтобы они вступили в силу.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Вкладки */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'notifications'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Уведомления
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'general'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Globe className="w-4 h-4 mr-2" />
            Общие
          </button>
        </div>

        <div className="p-6">
          {/* Вкладка уведомлений */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Telegram Bot настройки</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Токен Telegram бота
                    </label>
                    <input
                      type="password"
                      value={notificationSettings.telegramBotToken}
                      onChange={(e) => handleNotificationChange('telegramBotToken', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Получите у @BotFather в Telegram
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chat ID диспетчера
                    </label>
                    <input
                      type="text"
                      value={notificationSettings.dispatcherChatId}
                      onChange={(e) => handleNotificationChange('dispatcherChatId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ID чата для уведомлений диспетчера
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Типы уведомлений</h3>
                <div className="space-y-4">
                  {[
                    { key: 'newOrderNotifications', label: 'Уведомления о новых заказах', description: 'Отправлять уведомления диспетчеру о новых заказах' },
                    { key: 'statusUpdateNotifications', label: 'Уведомления об изменении статуса', description: 'Уведомлять при изменении статуса заказа' },
                    { key: 'driverAssignmentNotifications', label: 'Уведомления о назначении водителя', description: 'Уведомлять клиентов о назначенном водителе' },
                    { key: 'customerNotifications', label: 'Уведомления клиентам', description: 'Отправлять уведомления клиентам об изменениях' },
                    { key: 'systemAlerts', label: 'Системные уведомления', description: 'Уведомления об ошибках и системных событиях' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[key as keyof NotificationSettings] as boolean}
                          onChange={(e) => handleNotificationChange(key as keyof NotificationSettings, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Вкладка общих настроек */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о компании</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название компании
                    </label>
                    <input
                      type="text"
                      value={generalSettings.companyName}
                      onChange={(e) => handleGeneralChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Телефон поддержки
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.supportPhone}
                      onChange={(e) => handleGeneralChange('supportPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email поддержки
                    </label>
                    <input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Валюта
                    </label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => handleGeneralChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UZS">Узбекский сум (UZS)</option>
                      <option value="USD">Доллар США (USD)</option>
                      <option value="EUR">Евро (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Локализация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Язык по умолчанию
                    </label>
                    <select
                      value={generalSettings.defaultLanguage}
                      onChange={(e) => handleGeneralChange('defaultLanguage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ru">Русский</option>
                      <option value="uz">Узбекский</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Часовой пояс
                    </label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                      <option value="Asia/Samarkand">Asia/Samarkand (UTC+5)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Рабочее время</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Начало работы
                    </label>
                    <input
                      type="time"
                      value={generalSettings.workingHours.start}
                      onChange={(e) => handleGeneralChange('workingHours', {
                        ...generalSettings.workingHours,
                        start: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Конец работы
                    </label>
                    <input
                      type="time"
                      value={generalSettings.workingHours.end}
                      onChange={(e) => handleGeneralChange('workingHours', {
                        ...generalSettings.workingHours,
                        end: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Максимум дней для предзаказа
                    </label>
                    <input
                      type="number"
                      value={generalSettings.maxAdvanceBookingDays}
                      onChange={(e) => handleGeneralChange('maxAdvanceBookingDays', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
