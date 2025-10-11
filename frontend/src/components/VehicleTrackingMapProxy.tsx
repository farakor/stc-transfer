import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  wialonProxyService,
  getDemoVehiclePositions,
  VehiclePosition,
  WialonConfig
} from '../services/wialonProxyService';
import {
  Navigation,
  Fuel,
  Clock,
  MapPin,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Play,
  Square,
  Globe
} from 'lucide-react';

// Исправляем иконки маркеров Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VehicleTrackingMapProxyProps {
  height?: string;
  wialonConfig?: WialonConfig;
  refreshInterval?: number; // в секундах
  showControls?: boolean;
}

// Компонент для автоматического центрирования карты
const MapController: React.FC<{ vehicles: VehiclePosition[] }> = ({ vehicles }) => {
  const map = useMap();

  useEffect(() => {
    if (vehicles.length > 0) {
      const bounds = L.latLngBounds(
        vehicles.map(v => [v.latitude, v.longitude])
      );

      // Добавляем отступы для лучшего отображения
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [vehicles, map]);

  return null;
};

// Создаем кастомные иконки для разных статусов
const createVehicleIcon = (status: VehiclePosition['status'], course: number = 0) => {
  const colors = {
    moving: '#10B981', // зеленый
    stopped: '#F59E0B', // желтый  
    offline: '#EF4444', // красный
    online: '#3B82F6'   // синий
  };

  const color = colors[status];

  return L.divIcon({
    html: `
      <div style="
        width: 24px; 
        height: 24px; 
        background-color: ${color}; 
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${course}deg);
      ">
        <div style="
          width: 0; 
          height: 0; 
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-bottom: 8px solid white;
          transform: rotate(-${course}deg);
        "></div>
      </div>
    `,
    className: 'custom-vehicle-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const VehicleTrackingMapProxy: React.FC<VehicleTrackingMapProxyProps> = ({
  height = '500px',
  wialonConfig,
  refreshInterval = 30,
  showControls = true
}) => {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!wialonConfig);
  const [currentProxy, setCurrentProxy] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Центр карты по умолчанию (Ташкент)
  const defaultCenter: [number, number] = [41.2995, 69.2401];
  const defaultZoom = 11;

  // Инициализация Wialon при монтировании компонента
  useEffect(() => {
    if (wialonConfig && !isDemoMode) {
      initializeWialon();
    } else {
      // Используем демо-данные
      loadDemoData();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [wialonConfig, isDemoMode]);

  // Автообновление данных
  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refreshVehicleData();
      }, refreshInterval * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, isDemoMode]);

  const initializeWialon = async () => {
    if (!wialonConfig) return;

    try {
      setLoading(true);
      setError(null);

      wialonProxyService.initialize(wialonConfig);
      await wialonProxyService.login();

      setIsConnected(true);
      setCurrentProxy(wialonProxyService.getCurrentProxy());
      await loadVehicleData();
    } catch (err) {
      console.error('Wialon proxy initialization failed:', err);
      setError('Не удалось подключиться к Wialon через прокси. Используется демо-режим.');
      setIsDemoMode(true);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleData = async () => {
    try {
      const positions = await wialonProxyService.getVehiclePositions();
      setVehicles(positions);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to load vehicle data:', err);
      setError('Ошибка при загрузке данных о транспорте');
    }
  };

  const loadDemoData = () => {
    const demoData = getDemoVehiclePositions();
    setVehicles(demoData);
    setLastUpdate(new Date());
  };

  const refreshVehicleData = () => {
    if (isDemoMode) {
      loadDemoData();
    } else if (isConnected) {
      loadVehicleData();
    }
  };

  const handleManualRefresh = () => {
    setLoading(true);
    refreshVehicleData();
    setTimeout(() => setLoading(false), 1000);
  };

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    if (!isDemoMode) {
      loadDemoData();
    } else if (wialonConfig) {
      initializeWialon();
    }
  };

  const getStatusIcon = (status: VehiclePosition['status']) => {
    switch (status) {
      case 'moving': return <Play className="w-4 h-4 text-green-600" />;
      case 'stopped': return <Square className="w-4 h-4 text-yellow-600" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-600" />;
      default: return <Wifi className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusText = (status: VehiclePosition['status']) => {
    switch (status) {
      case 'moving': return 'В движении';
      case 'stopped': return 'Остановка';
      case 'offline': return 'Оффлайн';
      default: return 'Онлайн';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('ru-RU');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Заголовок и контролы */}
      {showControls && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Мониторинг транспорта (CORS-прокси)
                </h3>
                <p className="text-sm text-gray-500">
                  {isDemoMode ? 'Демо-режим' : 'Реальные данные Wialon через прокси'} •
                  {vehicles.length} транспортных средств
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Статус подключения */}
              <div className="flex items-center space-x-1">
                {isConnected || isDemoMode ? (
                  <Globe className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs text-gray-500">
                  {lastUpdate ? `Обновлено: ${lastUpdate.toLocaleTimeString('ru-RU')}` : 'Нет данных'}
                </span>
              </div>

              {/* Кнопка обновления */}
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Обновить данные"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Переключатель режима */}
              <button
                onClick={toggleDemoMode}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                title={isDemoMode ? 'Переключиться на реальные данные' : 'Переключиться на демо-режим'}
              >
                {isDemoMode ? 'Демо' : 'Прокси'}
              </button>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}

          {/* Информация о прокси */}
          {!isDemoMode && isConnected && currentProxy && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Подключение через CORS-прокси работает!<br>
                  <span className="text-xs">Прокси: {currentProxy}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Карта */}
      <div style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          className="rounded-b-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Автоматическое центрирование */}
          <MapController vehicles={vehicles} />

          {/* Маркеры транспорта */}
          {vehicles.map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={createVehicleIcon(vehicle.status, vehicle.course)}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(vehicle.status)}
                      <span className="text-xs font-medium">
                        {getStatusText(vehicle.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {vehicle.driver && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Водитель:</span>
                        <span className="font-medium">{vehicle.driver}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Скорость:</span>
                      <span className="font-medium">{vehicle.speed} км/ч</span>
                    </div>

                    {vehicle.fuel !== undefined && (
                      <div className="flex items-center space-x-2">
                        <Fuel className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Топливо:</span>
                        <span className="font-medium">{vehicle.fuel}%</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Обновлено:</span>
                      <span className="font-medium">{formatTime(vehicle.timestamp)}</span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Координаты: {vehicle.latitude.toFixed(6)}, {vehicle.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Статистика внизу */}
      {showControls && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {vehicles.filter(v => v.status === 'moving').length}
              </div>
              <div className="text-xs text-gray-500">В движении</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {vehicles.filter(v => v.status === 'stopped').length}
              </div>
              <div className="text-xs text-gray-500">На остановке</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {vehicles.filter(v => v.status === 'offline').length}
              </div>
              <div className="text-xs text-gray-500">Оффлайн</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {vehicles.length}
              </div>
              <div className="text-xs text-gray-500">Всего</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTrackingMapProxy;
