import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, RefreshCw, AlertCircle, MapPin, Activity, Clock } from 'lucide-react';
import { wialonJsonpService } from '../services/wialonJsonpService';
import { wialonConfig, vehicleMarkerStyles } from '../config/wialon.config';
import 'leaflet/dist/leaflet.css';

// Добавляем стили для кастомных маркеров
const markerStyles = `
  .custom-vehicle-marker {
    background: transparent !important;
    border: none !important;
  }
  
  .custom-vehicle-marker:hover {
    z-index: 1000 !important;
  }
  
  .vehicle-marker-tooltip {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .custom-vehicle-marker:hover .vehicle-marker-tooltip {
    opacity: 1;
  }
`;

// Добавляем стили в head если еще не добавлены
if (typeof document !== 'undefined' && !document.getElementById('vehicle-tracker-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'vehicle-tracker-styles';
  styleSheet.textContent = markerStyles;
  document.head.appendChild(styleSheet);
}

// Исправляем иконки Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WialonUnit {
  id: string;
  name: string;
  position?: {
    lat: number;
    lng: number;
    speed?: number;
    course?: number;
    time?: number;
  };
  status?: 'online' | 'offline' | 'moving' | 'stopped';
}

interface VehicleTrackerProps {
  wialonUnitId: string;
  vehicleName?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // в секундах
}

// Компонент для центрирования карты
const MapCenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Функция для определения направления по курсу
const getDirectionText = (course: number): string => {
  if (course >= 337.5 || course < 22.5) return '⬆️ Север';
  if (course >= 22.5 && course < 67.5) return '↗️ Северо-восток';
  if (course >= 67.5 && course < 112.5) return '➡️ Восток';
  if (course >= 112.5 && course < 157.5) return '↘️ Юго-восток';
  if (course >= 157.5 && course < 202.5) return '⬇️ Юг';
  if (course >= 202.5 && course < 247.5) return '↙️ Юго-запад';
  if (course >= 247.5 && course < 292.5) return '⬅️ Запад';
  if (course >= 292.5 && course < 337.5) return '↖️ Северо-запад';
  return '⬆️';
};

// Функция для определения SVG иконки транспорта
const getVehicleSvg = (name: string) => {
  const nameUpper = name.toUpperCase();
  
  // Автобусы
  if (nameUpper.includes('АВТОБУС') || 
      nameUpper.includes('HIGER') || 
      nameUpper.includes('BUS') ||
      nameUpper.includes('ЛКА')) {
    return '/bus.svg';
  }
  
  // Легковые автомобили
  if (nameUpper.includes('ЛЕГКОВОЙ') || 
      nameUpper.includes('HONGQI') ||
      nameUpper.includes('SEDAN') ||
      nameUpper.includes('КИА') ||
      nameUpper.includes('KIA') ||
      nameUpper.includes('CARNIVAL')) {
    return '/sedan.svg';
  }
  
  // Микроавтобусы
  if (nameUpper.includes('МИКРОАВТОБУС') || 
      nameUpper.includes('SPRINTER') ||
      nameUpper.includes('MERCEDES') ||
      nameUpper.includes('MERSEDES') ||
      nameUpper.includes('MINIVAN')) {
    return '/minivan.svg';
  }
  
  // По умолчанию седан (для обычных машин)
  return '/sedan.svg';
};

// Создание кастомной иконки транспорта
const createVehicleIcon = (vehicle: WialonUnit) => {
  const status = vehicle.status || 'offline';
  const style = vehicleMarkerStyles[status] || vehicleMarkerStyles.offline;
  const vehicleSvgPath = getVehicleSvg(vehicle.name);
  const speed = Math.round(vehicle.position?.speed || 0);
  const course = vehicle.position?.course || 0;
  
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 56px;
        height: 66px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      ">
        <!-- Tooltip с названием и направлением -->
        <div class="vehicle-marker-tooltip">
          ${vehicle.name}
          ${course > 0 ? `<br>Направление: ${getDirectionText(course)} (${course}°)` : ''}
          ${speed > 0 ? `<br>Скорость: ${speed} км/ч` : ''}
        </div>
        
        <!-- SVG иконка транспорта с поворотом по курсу -->
        <div style="
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.2s ease;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">
          <img src="${vehicleSvgPath}" 
               style="
                 width: 56px; 
                 height: 56px; 
                 object-fit: contain;
                 transform: rotate(${course}deg);
                 transition: transform 0.3s ease;
                 ${status === 'moving' ? 'filter: hue-rotate(120deg) saturate(1.2);' : ''}
                 ${status === 'stopped' ? 'filter: hue-rotate(60deg) saturate(1.1);' : ''}
                 ${status === 'offline' ? 'filter: grayscale(1) brightness(0.7);' : ''}
               " 
               alt="vehicle" />
        </div>
        
        <!-- Индикатор скорости -->
        ${status === 'moving' && speed > 0 ? `
          <div style="
            background: rgba(34, 197, 94, 0.9);
            color: white;
            font-size: 9px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 8px;
            margin-top: 2px;
            min-width: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${speed}
          </div>
        ` : ''}
      </div>
    `,
    className: 'custom-vehicle-marker',
    iconSize: [56, 66],
    iconAnchor: [28, 60]
  });
};

const VehicleTracker: React.FC<VehicleTrackerProps> = ({
  wialonUnitId,
  vehicleName,
  autoRefresh = true,
  refreshInterval = 30
}) => {
  const [unit, setUnit] = useState<WialonUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadVehiclePosition = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🚗 Loading position for unit ${wialonUnitId} via JSONP...`);
      
      // Инициализируем JSONP сервис
      wialonJsonpService.initialize(wialonConfig);
      
      // Авторизуемся если еще не авторизованы
      if (!wialonJsonpService.isAuthenticated()) {
        console.log('🔐 Logging in to Wialon...');
        await wialonJsonpService.login();
      }
      
      // Получаем все units через JSONP
      const vehicles = await wialonJsonpService.getVehicles();
      
      // Ищем нужный unit
      const vehicle = vehicles.find((v: any) => v.id.toString() === wialonUnitId);
      
      if (vehicle) {
        const pos = vehicle.pos;
        const now = Math.floor(Date.now() / 1000);
        
        let status: 'online' | 'offline' | 'moving' | 'stopped' = 'offline';
        
        if (pos && (now - pos.t) < 600) {
          const speed = pos.s || 0;
          status = speed > 5 ? 'moving' : 'stopped';
        }
        
        const unitData: WialonUnit = {
          id: vehicle.id.toString(),
          name: vehicle.nm || `Unit ${vehicle.id}`,
          position: pos ? {
            lat: pos.y,
            lng: pos.x,
            speed: pos.s || 0,
            course: pos.c || 0,
            time: pos.t || 0
          } : undefined,
          status
        };
        
        setUnit(unitData);
        setLastUpdate(new Date());
        console.log('✅ Position loaded successfully');
      } else {
        setError('Транспорт не найден в системе Wialon');
        console.error(`Unit ${wialonUnitId} not found in Wialon`);
      }
    } catch (err: any) {
      console.error('Failed to load vehicle position:', err);
      setError(`Не удалось загрузить данные: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehiclePosition();

    if (autoRefresh) {
      intervalRef.current = setInterval(loadVehiclePosition, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [wialonUnitId, autoRefresh, refreshInterval]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'moving':
        return 'text-green-600 bg-green-100';
      case 'stopped':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'moving':
        return 'В движении';
      case 'stopped':
        return 'Остановка';
      case 'offline':
        return 'Оффлайн';
      default:
        return 'Неизвестно';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatLastUpdateTime = (timestamp?: number) => {
    if (!timestamp) return 'Нет данных';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    
    if (diffMinutes < 1) return 'Только что';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    return date.toLocaleString('ru-RU');
  };

  if (loading && !unit) {
    return (
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-lg">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">Загрузка данных о транспорте...</p>
        </div>
      </div>
    );
  }

  if (error || !unit?.position) {
    return (
      <div className="p-8 bg-red-50 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-600" size={32} />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Данные недоступны</h3>
            <p className="text-red-700">
              {error || 'Нет данных о местоположении транспорта'}
            </p>
          </div>
        </div>
        <button
          onClick={loadVehiclePosition}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={18} />
          Попробовать снова
        </button>
      </div>
    );
  }

  const { position } = unit;
  const center: [number, number] = [position.lat, position.lng];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border" style={{ height: '250px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Используем карты 2GIS для лучшего покрытия России и СНГ */}
        <TileLayer
          attribution='&copy; <a href="https://2gis.ru/">2GIS</a>'
          url="https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1"
          subdomains={['0', '1', '2', '3']}
          maxZoom={18}
        />
        <MapCenter center={center} />
        <Marker position={center} icon={createVehicleIcon(unit)}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg mb-2">{vehicleName || unit.name}</h3>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Статус:</span>
                  <span className={`font-medium ${
                    unit.status === 'moving' ? 'text-green-600' :
                    unit.status === 'stopped' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {getStatusText(unit.status)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Скорость:</span>
                  <span>{Math.round(position.speed || 0)} км/ч</span>
                </div>
                
                {position.course !== undefined && position.course > 0 && (
                  <div className="flex justify-between">
                    <span>Направление:</span>
                    <span>{getDirectionText(position.course)} ({position.course}°)</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Координаты:</span>
                  <span className="font-mono text-xs">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Последнее обновление:</span>
                  <span>{formatLastUpdateTime(position.time)}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default VehicleTracker;

