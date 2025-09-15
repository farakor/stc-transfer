import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Save,
  AlertCircle,
  CheckCircle,
  Car,
  Users,
  Plus,
  MapPin,
  Navigation,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  RefreshCw,
  ArrowRight,
  Clock,
  Calculator
} from 'lucide-react';

interface VehicleModel {
  brand: string;
  model: string;
  name: string;
  type: string;
  capacity: number;
  features: string[];
  description?: string;
  count: number;
}

interface LocationData {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
}

interface RouteData {
  id: number;
  from_location: LocationData;
  to_location: LocationData;
  distance_km?: number | null;
  estimated_duration_minutes?: number | null;
  is_active: boolean;
}

interface TariffData {
  id: number;
  route_id: number;
  vehicle_brand: string;
  vehicle_model: string;
  base_price: number;
  price_per_km: number;
  minimum_price?: number;
  night_surcharge_percent?: number;
  holiday_surcharge_percent?: number;
  waiting_price_per_minute?: number;
  is_active: boolean;
  valid_from?: Date;
  valid_until?: Date;
  route?: RouteData;
}

interface TariffMatrix {
  routes: RouteData[];
  vehicleModels: VehicleModel[];
  tariffs: { [routeId: number]: { [vehicleKey: string]: TariffData } };
}

const TariffsManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrix, setMatrix] = useState<TariffMatrix | null>(null);
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [editingTariff, setEditingTariff] = useState<TariffData | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'matrix' | 'routes' | 'locations'>('matrix');
  const [newVehiclesCount, setNewVehiclesCount] = useState(0);

  // Форма для тарифа
  const [tariffForm, setTariffForm] = useState({
    route_id: 0,
    vehicle_brand: '',
    vehicle_model: '',
    base_price: 0,
    price_per_km: 0,
    minimum_price: 0,
    night_surcharge_percent: 0,
    holiday_surcharge_percent: 0,
    waiting_price_per_minute: 0,
    is_active: true
  });

  // Форма для локации
  const [locationForm, setLocationForm] = useState({
    name: '',
    type: 'city'
  });

  // Форма для маршрута
  const [routeForm, setRouteForm] = useState({
    from_location_id: 0,
    to_location_id: 0,
    distance_km: 0,
    estimated_duration_minutes: 0
  });

  useEffect(() => {
    loadTariffMatrix();

    // Автоматическое обновление каждые 30 секунд
    const interval = setInterval(() => {
      console.log('🔄 Автоматическое обновление матрицы тарифов...');
      loadTariffMatrix(true); // silent = true для автообновления
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAllLocations = async () => {
    try {
      console.log('📍 Загружаем все локации...');

      const response = await fetch('http://localhost:3001/api/admin/tariffs/locations');

      if (!response.ok) {
        throw new Error('Ошибка загрузки локаций');
      }

      const result = await response.json();

      if (result.success) {
        setAllLocations(result.data);
        console.log('✅ Загружено локаций:', result.data.length);
      } else {
        throw new Error(result.error || 'Ошибка загрузки локаций');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки локаций:', error);
    }
  };

  const loadTariffMatrix = async (silent = false) => {
    try {
      console.log('🔄 Начинаем загрузку матрицы тарифов...');
      if (!silent) {
        setLoading(true);
        setSaveStatus('idle');
      }

      const response = await fetch('http://localhost:3001/api/admin/tariffs/matrix');
      console.log('📡 Ответ от сервера:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Полученные данные:', data);

      if (data.success) {
        const oldVehicleCount = matrix?.vehicleModels?.length || 0;
        const newVehicleCount = data.data.vehicleModels?.length || 0;

        setMatrix(data.data);
        console.log('✅ Матрица тарифов загружена успешно');

        // Также загружаем все локации
        await loadAllLocations();

        // Уведомляем о новых автомобилях
        if (oldVehicleCount > 0 && newVehicleCount > oldVehicleCount) {
          const newCount = newVehicleCount - oldVehicleCount;
          console.log(`🚗 Обнаружено ${newCount} новых автомобилей!`);
          setNewVehiclesCount(newCount);
          if (!silent) {
            setSaveStatus('success');
          }
        } else if (!silent) {
          setSaveStatus('success');
          setNewVehiclesCount(0); // Сбрасываем счетчик при ручном обновлении
        }
      } else {
        throw new Error(data.error || 'Ошибка загрузки данных');
      }

    } catch (error) {
      console.error('❌ Ошибка загрузки матрицы тарифов:', error);
      if (!silent) {
        setSaveStatus('error');

        // Показываем пользователю детальную ошибку
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        alert(`Ошибка загрузки данных: ${errorMessage}\n\nПроверьте:\n1. Запущен ли бэкенд на порту 3001\n2. Консоль браузера для подробностей`);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const saveTariff = async (tariffData: any) => {
    try {
      setSaving(true);
      setSaveStatus('idle');

      const response = await fetch('http://localhost:3001/api/admin/tariffs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tariffData),
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения тарифа');
      }

      const result = await response.json();
      if (result.success) {
        setSaveStatus('success');
        await loadTariffMatrix(); // Перезагружаем данные
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(result.error || 'Ошибка сохранения тарифа');
      }

    } catch (error) {
      console.error('Ошибка сохранения тарифа:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTariffEdit = (route: RouteData, vehicle: VehicleModel) => {
    const vehicleKey = `${vehicle.brand}-${vehicle.model}`;
    const existingTariff = matrix?.tariffs[route.id]?.[vehicleKey];

    if (existingTariff) {
      setTariffForm({
        route_id: existingTariff.route_id,
        vehicle_brand: existingTariff.vehicle_brand,
        vehicle_model: existingTariff.vehicle_model,
        base_price: existingTariff.base_price,
        price_per_km: existingTariff.price_per_km,
        minimum_price: existingTariff.minimum_price || 0,
        night_surcharge_percent: existingTariff.night_surcharge_percent || 0,
        holiday_surcharge_percent: existingTariff.holiday_surcharge_percent || 0,
        waiting_price_per_minute: existingTariff.waiting_price_per_minute || 0,
        is_active: existingTariff.is_active
      });
      setEditingTariff(existingTariff);
    } else {
      setTariffForm({
        route_id: route.id,
        vehicle_brand: vehicle.brand,
        vehicle_model: vehicle.model,
        base_price: 0,
        price_per_km: 0,
        minimum_price: 0,
        night_surcharge_percent: 0,
        holiday_surcharge_percent: 0,
        waiting_price_per_minute: 0,
        is_active: true
      });
      setEditingTariff(null);
    }
  };

  const handleSaveTariff = async () => {
    await saveTariff(tariffForm);
    setEditingTariff(null);
  };

  const createLocation = async () => {
    try {
      console.log('🏙️ Начинаем создание локации:', locationForm);
      setSaving(true);

      if (!locationForm.name || !locationForm.type) {
        throw new Error('Не заполнены обязательные поля');
      }

      const response = await fetch('http://localhost:3001/api/admin/tariffs/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationForm)
      });

      console.log('📡 Ответ сервера:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', errorText);
        throw new Error(`Ошибка создания локации: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Результат создания:', result);

      if (result.success) {
        console.log('🎉 Локация создана успешно, ID:', result.data.id);
        console.log('🚪 Закрываем модальное окно...');
        setShowAddLocationModal(false);
        console.log('🧹 Очищаем форму...');
        setLocationForm({ name: '', type: 'city' });
        console.log('✅ Устанавливаем статус успеха...');
        setSaveStatus('success');
        console.log('🔄 Обновляем матрицу...');
        await loadTariffMatrix();
        console.log('⏰ Устанавливаем таймер для сброса статуса...');
        setTimeout(() => {
          console.log('🔄 Сбрасываем статус на idle');
          setSaveStatus('idle');
        }, 3000);
      } else {
        throw new Error(result.error || 'Ошибка создания локации');
      }
    } catch (error) {
      console.error('❌ Ошибка создания локации:', error);
      alert(`Ошибка создания локации: ${error.message}`);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const createRoute = async () => {
    try {
      setSaving(true);
      const response = await fetch('http://localhost:3001/api/admin/tariffs/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeForm)
      });

      if (!response.ok) {
        throw new Error('Ошибка создания маршрута');
      }

      const result = await response.json();
      if (result.success) {
        setShowAddRouteModal(false);
        setRouteForm({ from_location_id: 0, to_location_id: 0, distance_km: 0, estimated_duration_minutes: 0 });
        setSaveStatus('success');
        await loadTariffMatrix();
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(result.error || 'Ошибка создания маршрута');
      }
    } catch (error) {
      console.error('Ошибка создания маршрута:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'airport': return '✈️';
      case 'station': return '🚂';
      case 'attraction': return '🏛️';
      default: return '🏙️';
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'SEDAN': return '🚗';
      case 'PREMIUM': return '🚙';
      case 'MINIVAN': return '🚐';
      case 'MICROBUS': return '🚌';
      case 'BUS': return '🚍';
      default: return '🚗';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' сум';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="text-center">
          <p className="text-gray-600 mb-2">Загрузка данных тарифов...</p>
          <p className="text-sm text-gray-500">Подключение к серверу на порту 3001</p>
          {saveStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 mb-2">❌ Ошибка загрузки данных</p>
              <button
                onClick={loadTariffMatrix}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🔄 Повторить попытку
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Ошибка загрузки данных</p>
          <button
            onClick={loadTariffMatrix}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calculator className="w-8 h-8 mr-3 text-blue-600" />
            Конструктор тарифов
          </h1>
          <p className="text-gray-600 mt-1">
            Управление ценами по маршрутам и моделям автомобилей
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {newVehiclesCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium">
                🚗 Обнаружено {newVehiclesCount} новых автомобилей!
              </p>
              <p className="text-xs text-green-600">
                Они уже добавлены в матрицу тарифов
              </p>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-gray-500">
              💡 Добавили новый автомобиль? Нажмите "Обновить"
            </p>
            <p className="text-xs text-gray-400">
              Автообновление каждые 30 сек
            </p>
          </div>
          <button
            onClick={() => loadTariffMatrix(false)}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
            {newVehiclesCount > 0 && (
              <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                +{newVehiclesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Статус сохранения */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800">Тариф успешно сохранен</p>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">Ошибка сохранения тарифа</p>
          </div>
        </div>
      )}

      {/* Вкладки */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'matrix'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Матрица тарифов
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'routes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Маршруты ({matrix.routes.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'locations'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Локации ({allLocations.length})
          </button>
        </div>

        <div className="p-6">
          {/* Матрица тарифов */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск маршрутов..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {matrix.routes.length} маршрутов × {matrix.vehicleModels.length} моделей
                </div>
              </div>

              {/* Таблица матрицы */}
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-gray-50 border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 min-w-[200px]">
                        Маршрут
                      </th>
                      {matrix.vehicleModels.map((vehicle) => (
                        <th
                          key={`${vehicle.brand}-${vehicle.model}`}
                          className="border border-gray-200 px-3 py-3 text-center text-sm font-medium text-gray-700 min-w-[120px]"
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-lg mb-1">{getVehicleTypeIcon(vehicle.type)}</span>
                            <span className="font-semibold">{vehicle.brand}</span>
                            <span className="text-xs text-gray-500">{vehicle.model}</span>
                            <span className="text-xs text-blue-600">({vehicle.count} авто)</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.routes
                      .filter(route =>
                        !searchTerm ||
                        route.from_location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        route.to_location.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((route) => (
                        <tr key={route.id} className="hover:bg-gray-50">
                          <td className="sticky left-0 bg-white border border-gray-200 px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{getLocationTypeIcon(route.from_location.type)}</span>
                              <span className="font-medium text-sm">{route.from_location.name}</span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{getLocationTypeIcon(route.to_location.type)}</span>
                              <span className="font-medium text-sm">{route.to_location.name}</span>
                            </div>
                            {route.distance_km && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                                <span>📏 {route.distance_km} км</span>
                                {route.estimated_duration_minutes && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {Math.floor(route.estimated_duration_minutes / 60)}ч {route.estimated_duration_minutes % 60}м
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          {matrix.vehicleModels.map((vehicle) => {
                            const vehicleKey = `${vehicle.brand}-${vehicle.model}`;
                            const tariff = matrix.tariffs[route.id]?.[vehicleKey];

                            return (
                              <td
                                key={vehicleKey}
                                className="border border-gray-200 px-3 py-3 text-center"
                              >
                                {tariff ? (
                                  <div className="space-y-1">
                                    <div className="text-sm font-semibold text-green-700">
                                      {formatPrice(tariff.base_price)}
                                    </div>
                                    {tariff.price_per_km > 0 && (
                                      <div className="text-xs text-gray-600">
                                        +{formatPrice(tariff.price_per_km)}/км
                                      </div>
                                    )}
                                    <button
                                      onClick={() => handleTariffEdit(route, vehicle)}
                                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center mx-auto"
                                    >
                                      <Edit3 className="w-3 h-3 mr-1" />
                                      Изменить
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleTariffEdit(route, vehicle)}
                                    className="text-xs text-gray-400 hover:text-blue-600 flex items-center mx-auto"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Добавить
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Маршруты */}
          {activeTab === 'routes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Управление маршрутами</h3>
                <button
                  onClick={() => setShowAddRouteModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить маршрут
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matrix.routes.map((route) => (
                  <div key={route.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span>{getLocationTypeIcon(route.from_location.type)}</span>
                        <span className="font-medium text-sm">{route.from_location.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center space-x-2">
                        <span>{getLocationTypeIcon(route.to_location.type)}</span>
                        <span className="font-medium text-sm">{route.to_location.name}</span>
                      </div>
                    </div>

                    {route.distance_km && (
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>📏 Расстояние: {route.distance_km} км</div>
                        {route.estimated_duration_minutes && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Время: {Math.floor(route.estimated_duration_minutes / 60)}ч {route.estimated_duration_minutes % 60}м
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Тарифов: {Object.keys(matrix.tariffs[route.id] || {}).length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Локации */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Управление локациями</h3>
                <button
                  onClick={() => setShowAddLocationModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить локацию
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allLocations.map((location) => (
                  <div key={location.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getLocationTypeIcon(location.type)}</span>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{location.type}</div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Маршрутов: {matrix.routes.filter(r =>
                        r.from_location.id === location.id || r.to_location.id === location.id
                      ).length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модал редактирования тарифа */}
      {(editingTariff !== null || tariffForm.route_id > 0) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingTariff ? 'Редактировать тариф' : 'Добавить тариф'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Базовая цена (сум)
                </label>
                <input
                  type="number"
                  value={tariffForm.base_price}
                  onChange={(e) => setTariffForm({ ...tariffForm, base_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена за км (сум)
                </label>
                <input
                  type="number"
                  value={tariffForm.price_per_km}
                  onChange={(e) => setTariffForm({ ...tariffForm, price_per_km: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Минимальная цена (сум)
                </label>
                <input
                  type="number"
                  value={tariffForm.minimum_price}
                  onChange={(e) => setTariffForm({ ...tariffForm, minimum_price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ночная наценка (%)
                  </label>
                  <input
                    type="number"
                    value={tariffForm.night_surcharge_percent}
                    onChange={(e) => setTariffForm({ ...tariffForm, night_surcharge_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Праздничная наценка (%)
                  </label>
                  <input
                    type="number"
                    value={tariffForm.holiday_surcharge_percent}
                    onChange={(e) => setTariffForm({ ...tariffForm, holiday_surcharge_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ожидание (сум/мин)
                </label>
                <input
                  type="number"
                  value={tariffForm.waiting_price_per_minute}
                  onChange={(e) => setTariffForm({ ...tariffForm, waiting_price_per_minute: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingTariff(null);
                  setTariffForm({
                    route_id: 0,
                    vehicle_brand: '',
                    vehicle_model: '',
                    base_price: 0,
                    price_per_km: 0,
                    minimum_price: 0,
                    night_surcharge_percent: 0,
                    holiday_surcharge_percent: 0,
                    waiting_price_per_minute: 0,
                    is_active: true
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveTariff}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модал добавления локации */}
      {showAddLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Добавить локацию</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => {
                    console.log('📝 Изменение названия локации:', e.target.value);
                    setLocationForm({ ...locationForm, name: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Ургенч"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип
                </label>
                <select
                  value={locationForm.type}
                  onChange={(e) => {
                    console.log('📝 Изменение типа локации:', e.target.value);
                    setLocationForm({ ...locationForm, type: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="city">Город</option>
                  <option value="airport">Аэропорт</option>
                  <option value="station">Вокзал</option>
                  <option value="attraction">Достопримечательность</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddLocationModal(false);
                  setLocationForm({ name: '', type: 'city' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  console.log('🔘 Нажата кнопка создания локации');
                  console.log('📋 Текущие данные формы:', locationForm);
                  if (!saving) {
                    createLocation();
                  } else {
                    console.log('⚠️ Операция уже выполняется, игнорируем клик');
                  }
                }}
                disabled={saving || !locationForm.name.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модал добавления маршрута */}
      {showAddRouteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Добавить маршрут</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Откуда
                </label>
                <select
                  value={routeForm.from_location_id}
                  onChange={(e) => setRouteForm({ ...routeForm, from_location_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Выберите локацию</option>
                  {allLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {getLocationTypeIcon(location.type)} {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Куда
                </label>
                <select
                  value={routeForm.to_location_id}
                  onChange={(e) => setRouteForm({ ...routeForm, to_location_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Выберите локацию</option>
                  {allLocations
                    .filter(location => location.id !== routeForm.from_location_id)
                    .map((location) => (
                      <option key={location.id} value={location.id}>
                        {getLocationTypeIcon(location.type)} {location.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Расстояние (км)
                  </label>
                  <input
                    type="number"
                    value={routeForm.distance_km}
                    onChange={(e) => setRouteForm({ ...routeForm, distance_km: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время (мин)
                  </label>
                  <input
                    type="number"
                    value={routeForm.estimated_duration_minutes}
                    onChange={(e) => setRouteForm({ ...routeForm, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddRouteModal(false);
                  setRouteForm({ from_location_id: 0, to_location_id: 0, distance_km: 0, estimated_duration_minutes: 0 });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={createRoute}
                disabled={saving || !routeForm.from_location_id || !routeForm.to_location_id}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TariffsManagement;
