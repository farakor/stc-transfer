import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { wialonJsonpService, WialonConfig, VehiclePosition } from '../services/wialonJsonpService';
import { vehicleMarkerStyles } from '../config/wialon.config';

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

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
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

interface VehicleTrackingMapJsonpProps {
  wialonConfig: WialonConfig;
  height?: string;
  refreshInterval?: number;
  showControls?: boolean;
}

const VehicleTrackingMapJsonp: React.FC<VehicleTrackingMapJsonpProps> = ({
  wialonConfig,
  height = '400px',
  refreshInterval = 30,
  showControls = true,
}) => {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    moving: 0,
    stopped: 0,
    offline: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const isFirstLoadRef = useRef<boolean>(true);

  // Инициализация и подключение к Wialon
  useEffect(() => {
    initializeWialon();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      wialonJsonpService.logout();
    };
  }, [wialonConfig]);

  // Настройка автообновления
  useEffect(() => {
    if (isConnected && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchVehiclePositions();
      }, refreshInterval * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isConnected, refreshInterval]);

  const initializeWialon = async () => {
    try {
      setLoading(true);
      setError(null);

      // Инициализируем JSONP сервис
      wialonJsonpService.initialize(wialonConfig);

      // Авторизуемся
      const session = await wialonJsonpService.login();
      console.log('Wialon JSONP connected:', session);

      setIsConnected(true);
      
      // Загружаем начальные данные
      await fetchVehiclePositions();
    } catch (err: any) {
      console.error('Wialon JSONP connection error:', err);
      setError(`Ошибка подключения к Wialon: ${err.message}`);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclePositions = async () => {
    try {
      const positions = await wialonJsonpService.getVehiclePositions();
      
      // Отладочная информация
      console.log('🚌 Получено позиций транспорта:', positions.length);
      const validPositions = positions.filter(v => v.latitude !== 0 || v.longitude !== 0);
      const invalidPositions = positions.filter(v => v.latitude === 0 && v.longitude === 0);
      console.log('✅ Валидных координат:', validPositions.length);
      console.log('❌ Нулевых координат (0,0):', invalidPositions.length);
      
      if (validPositions.length > 0) {
        console.log('📍 Примеры валидных координат:');
        validPositions.slice(0, 3).forEach(v => {
          console.log(`  - ${v.name}: ${v.latitude}, ${v.longitude}`);
        });
      }
      
      if (invalidPositions.length > 0) {
        console.log('⚠️ Транспорт с нулевыми координатами:');
        invalidPositions.slice(0, 3).forEach(v => {
          console.log(`  - ${v.name}: ${v.latitude}, ${v.longitude}`);
        });
      }
      
      setVehicles(positions);
      setLastUpdate(new Date());
      setError(null); // Очищаем ошибку при успешном получении данных
      
      // Обновляем статистику
      updateStats(positions);
      
      // Центрируем карту на транспорте только при первой загрузке
      if (positions.length > 0 && mapRef.current && isFirstLoadRef.current) {
        centerMapOnVehicles(positions);
        isFirstLoadRef.current = false; // Больше не центрируем автоматически
      }
    } catch (err: any) {
      console.error('Error fetching vehicle positions:', err);
      
      // Если ошибка связана с сессией, пытаемся переподключиться
      if (err.message.includes('Wialon API Error: 4') || err.message.includes('Invalid session')) {
        console.log('Session error detected, attempting to reconnect...');
        setError('Сессия истекла, переподключение...');
        
        // Даем небольшую задержку и пытаемся переподключиться
        setTimeout(() => {
          initializeWialon();
        }, 2000);
      } else {
        setError(`Ошибка получения данных: ${err.message}`);
      }
    }
  };

  const updateStats = (positions: VehiclePosition[]) => {
    const total = positions.length;
    let online = 0;
    let moving = 0;
    let stopped = 0;

    positions.forEach(vehicle => {
      if (vehicle.status === 'moving') {
        online++;
        moving++;
      } else if (vehicle.status === 'stopped') {
        online++;
        stopped++;
      }
    });

    setStats({
      total,
      online,
      moving,
      stopped,
      offline: total - online,
    });
  };

  const centerMapOnVehicles = (positions: VehiclePosition[]) => {
    if (!mapRef.current || positions.length === 0) return;

    const validPositions = positions.filter(v => v.latitude !== 0 && v.longitude !== 0);
    if (validPositions.length === 0) return;

    if (validPositions.length === 1) {
      // Один транспорт - центрируем на нем
      const vehicle = validPositions[0];
      mapRef.current.setView([vehicle.latitude, vehicle.longitude], 15);
    } else {
      // Несколько транспортов - показываем все
      const bounds = L.latLngBounds(
        validPositions.map(v => [v.latitude, v.longitude])
      );
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  // Функция для преобразования градусов в направление
  const getDirectionText = (course: number) => {
    if (course === 0) return '';
    if (course >= 337.5 || course < 22.5) return 'С';
    if (course >= 22.5 && course < 67.5) return 'СВ';
    if (course >= 67.5 && course < 112.5) return 'В';
    if (course >= 112.5 && course < 157.5) return 'ЮВ';
    if (course >= 157.5 && course < 202.5) return 'Ю';
    if (course >= 202.5 && course < 247.5) return 'ЮЗ';
    if (course >= 247.5 && course < 292.5) return 'З';
    if (course >= 292.5 && course < 337.5) return 'СЗ';
    return '';
  };

  const createVehicleIcon = (vehicle: VehiclePosition) => {
    const style = vehicleMarkerStyles[vehicle.status] || vehicleMarkerStyles.offline;
    
    // Определяем SVG иконку транспорта по типу
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
      
      // По умолчанию автобус
      return '/bus.svg';
    };

    const vehicleSvgPath = getVehicleSvg(vehicle.name);
    const speed = Math.round(vehicle.speed);
    
    // Отладочная информация для проверки типов транспорта
    console.log(`🚗 Транспорт: ${vehicle.name} -> Иконка: ${vehicleSvgPath}, Курс: ${vehicle.course}°, Скорость: ${speed} км/ч`);
    
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
            ${vehicle.course > 0 ? `<br>Направление: ${getDirectionText(vehicle.course)} (${vehicle.course}°)` : ''}
            ${speed > 0 ? `<br>Скорость: ${speed} км/ч` : ''}
          </div>
          
          <!-- Чистая SVG иконка как в Uber -->
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
            <!-- SVG иконка транспорта с поворотом по курсу -->
            <img src="${vehicleSvgPath}" 
                 style="
                   width: 56px; 
                   height: 56px; 
                   object-fit: contain;
                   transform: rotate(${vehicle.course}deg);
                   transition: transform 0.3s ease;
                   ${vehicle.status === 'moving' ? 'filter: hue-rotate(120deg) saturate(1.2);' : ''}
                   ${vehicle.status === 'stopped' ? 'filter: hue-rotate(60deg) saturate(1.1);' : ''}
                   ${vehicle.status === 'offline' ? 'filter: grayscale(1) brightness(0.7);' : ''}
                 " 
                 alt="vehicle" />
          </div>
          
          <!-- Минималистичный индикатор скорости -->
          ${vehicle.status === 'moving' && speed > 0 ? `
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
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            ">${speed}</div>
          ` : ''}
          
        </div>
        
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.5; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          
          .custom-vehicle-marker:hover > div:nth-child(2) {
            transform: scale(1.1);
          }
        </style>
      `,
      className: 'custom-vehicle-marker',
      iconSize: [56, 66],
      iconAnchor: [28, 28],
    });
  };

  const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return 'Неизвестно';
    
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Только что';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} ч назад`;
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Подключение к Wialon через JSONP...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={initializeWialon}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Панель управления */}
      {showControls && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {isConnected ? 'Подключено (JSONP)' : 'Не подключено'}
                </span>
              </div>
              
              {lastUpdate && (
                <div className="text-sm text-gray-600">
                  Обновлено: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchVehiclePositions}
                disabled={!isConnected}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                Обновить
              </button>
              
              <button
                onClick={() => centerMapOnVehicles(vehicles)}
                disabled={vehicles.length === 0}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
                title="Показать весь транспорт на карте"
              >
                Показать все
              </button>
              
              <button
                onClick={initializeWialon}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Переподключить
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-medium">Всего:</span>
              <span>{stats.total}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>В движении: {stats.moving}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Остановка: {stats.stopped}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Оффлайн: {stats.offline}</span>
            </div>
          </div>
        </div>
      )}

      {/* Карта */}
      <div style={{ height }} className="rounded-lg overflow-hidden border">
        <MapContainer
          center={[39.658472, 67.067966]} // Координаты по умолчанию
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          {/* Используем карты 2GIS для лучшего покрытия России и СНГ */}
          <TileLayer
            attribution='&copy; <a href="https://2gis.ru/">2GIS</a>'
            url="https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1"
            subdomains={['0', '1', '2', '3']}
            maxZoom={18}
          />
          
          {vehicles.map((vehicle) => {
            // Пропускаем транспорт без координат
            if (vehicle.latitude === 0 && vehicle.longitude === 0) {
              return null;
            }

            return (
              <Marker
                key={vehicle.id}
                position={[vehicle.latitude, vehicle.longitude]}
                icon={createVehicleIcon(vehicle)}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-2">{vehicle.name}</h3>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Статус:</span>
                        <span className={`font-medium ${
                          vehicle.status === 'moving' ? 'text-green-600' :
                          vehicle.status === 'stopped' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {vehicleMarkerStyles[vehicle.status]?.label || 'Неизвестно'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Скорость:</span>
                        <span>{vehicle.speed} км/ч</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Координаты:</span>
                        <span>{vehicle.latitude.toFixed(6)}, {vehicle.longitude.toFixed(6)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Последнее обновление:</span>
                        <span>{formatLastSeen(vehicle.timestamp)}</span>
                      </div>
                      
                      {vehicle.driver && (
                        <div className="flex justify-between">
                          <span>Водитель:</span>
                          <span>{vehicle.driver}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Информация о транспорте */}
      {vehicles.length === 0 && isConnected && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Транспортные средства не найдены. Проверьте настройки доступа в Wialon.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleTrackingMapJsonp;