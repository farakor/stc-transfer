import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Car,
  Users,
  DollarSign,
  MapPin,
  RefreshCw,
  X,
  Save,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Vehicle {
  id: string;
  type: 'SEDAN' | 'PREMIUM' | 'MINIVAN' | 'MICROBUS' | 'BUS';
  name: string;
  brand?: string;
  model?: string;
  license_plate?: string;
  capacity: number;
  pricePerKm: number;
  status: 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
  description?: string;
  features: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  driver?: {
    id: string;
    name: string;
    phone: string;
  };
}

interface VehicleFormData {
  type: string;
  name: string;
  brand: string;
  model: string;
  license_plate: string;
  capacity: number;
  pricePerKm: number;
  status: string;
  description: string;
  features: string[];
}

const VehiclesManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'MAINTENANCE'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SEDAN' | 'PREMIUM' | 'MINIVAN' | 'MICROBUS' | 'BUS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    type: 'SEDAN',
    name: '',
    brand: '',
    model: '',
    license_plate: '',
    capacity: 3,
    pricePerKm: 1500,
    status: 'AVAILABLE',
    description: '',
    features: []
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      console.log('🚗 Начинаем загрузку автомобилей...');
      setLoading(true);

      const response = await fetch('/api/vehicles/all');
      const data = await response.json();

      console.log('📦 Получен ответ от API автомобилей:', data);

      if (data.success && data.data) {
        setVehicles(data.data);
        console.log(`✅ Загружено ${data.data.length} автомобилей`);
      } else {
        console.error('❌ API автомобилей вернул ошибку:', data.error);
        setVehicles([]);
      }
    } catch (error) {
      console.error('❌ Ошибка при получении автомобилей:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVehicle(null);
    setFormData({
      type: 'SEDAN',
      name: '',
      brand: '',
      model: '',
      license_plate: '',
      capacity: 3,
      pricePerKm: 1500,
      status: 'AVAILABLE',
      description: '',
      features: []
    });
    setShowModal(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      type: vehicle.type,
      name: vehicle.name,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      license_plate: vehicle.license_plate || '',
      capacity: vehicle.capacity,
      pricePerKm: vehicle.pricePerKm,
      status: vehicle.status,
      description: vehicle.description || '',
      features: vehicle.features || []
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.brand.trim() || !formData.model.trim() || !formData.license_plate.trim()) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      console.log('💾 Сохранение автомобиля:', formData);

      if (editingVehicle) {
        // Обновление существующего автомобиля
        const response = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update vehicle');
        }

        alert('✅ Автомобиль успешно обновлен!');
      } else {
        // Создание нового автомобиля
        const response = await fetch('/api/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create vehicle');
        }

        alert('✅ Автомобиль успешно добавлен!');
      }

      setShowModal(false);
      fetchVehicles(); // Перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка при сохранении автомобиля:', error);
      alert('❌ Ошибка при сохранении автомобиля');
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      alert('✅ Автомобиль удален!');
      fetchVehicles(); // Перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка при удалении автомобиля:', error);
      alert('❌ Ошибка при удалении автомобиля');
    }
  };

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      alert('✅ Статус автомобиля обновлен!');
      fetchVehicles(); // Перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка при изменении статуса:', error);
      alert('❌ Ошибка при изменении статуса');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MAINTENANCE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Доступен';
      case 'BUSY': return 'Занят';
      case 'MAINTENANCE': return 'На обслуживании';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'BUSY': return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'MAINTENANCE': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SEDAN': return 'bg-blue-100 text-blue-800';
      case 'PREMIUM': return 'bg-purple-100 text-purple-800';
      case 'MINIVAN': return 'bg-green-100 text-green-800';
      case 'MICROBUS': return 'bg-orange-100 text-orange-800';
      case 'BUS': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'SEDAN': return 'Седан';
      case 'PREMIUM': return 'Премиум';
      case 'MINIVAN': return 'Минивэн';
      case 'MICROBUS': return 'Микроавтобус';
      case 'BUS': return 'Автобус';
      default: return type;
    }
  };

  const addFeature = () => {
    const newFeature = prompt('Введите новую особенность автомобиля:');
    if (newFeature && newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesFilter = filter === 'ALL' || vehicle.status === filter;
    const matchesTypeFilter = typeFilter === 'ALL' || vehicle.type === typeFilter;
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesTypeFilter && matchesSearch;
  });

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'AVAILABLE').length,
    busy: vehicles.filter(v => v.status === 'BUSY').length,
    maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length
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
          <h1 className="text-3xl font-bold text-gray-900">Управление транспортом</h1>
          <p className="text-gray-600 mt-1">Управление автопарком и техническим состоянием</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchVehicles}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить автомобиль
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего автомобилей</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Car className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Доступны</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">В работе</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.busy}</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">На обслуживании</p>
              <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по марке, модели, госномеру, водителю..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Все статусы</option>
              <option value="AVAILABLE">Доступные</option>
              <option value="BUSY">Занятые</option>
              <option value="MAINTENANCE">На обслуживании</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Все типы</option>
              <option value="SEDAN">Седаны</option>
              <option value="PREMIUM">Премиум</option>
              <option value="MINIVAN">Минивэны</option>
              <option value="MICROBUS">Микроавтобусы</option>
              <option value="BUS">Автобусы</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список автомобилей */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Автомобиль</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Тип/Вместимость</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Водитель</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Статус</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Тариф</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-600">
                          {vehicle.license_plate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(vehicle.type)}`}>
                        {getTypeText(vehicle.type)}
                      </span>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {vehicle.capacity} мест
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {vehicle.driver ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.driver.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {vehicle.driver.phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Не назначен</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(vehicle.status)}
                      <select
                        value={vehicle.status}
                        onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                        className={`text-xs font-medium rounded-full border px-2 py-1 ${getStatusColor(vehicle.status)}`}
                      >
                        <option value="AVAILABLE">Доступен</option>
                        <option value="BUSY">Занят</option>
                        <option value="MAINTENANCE">На обслуживании</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {vehicle.pricePerKm.toLocaleString()} сум/км
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Автомобили не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры или добавить новый автомобиль</p>
          </div>
        )}
      </div>

      {/* Модал создания/редактирования автомобиля */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingVehicle ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип автомобиля *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="SEDAN">Седан</option>
                  <option value="PREMIUM">Премиум</option>
                  <option value="MINIVAN">Минивэн</option>
                  <option value="MICROBUS">Микроавтобус</option>
                  <option value="BUS">Автобус</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="например: Kia Carnival"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Марка *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="например: Kia"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Модель *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="например: Carnival"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Государственный номер *
                </label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="01 A 123 BC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Вместимость (человек) *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тариф (сум/км) *
                </label>
                <input
                  type="number"
                  value={formData.pricePerKm}
                  onChange={(e) => setFormData({ ...formData, pricePerKm: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">Доступен</option>
                  <option value="BUSY">Занят</option>
                  <option value="MAINTENANCE">На обслуживании</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Описание автомобиля и его особенности"
              />
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Особенности
                </label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Добавить
                </button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.features];
                        newFeatures[index] = e.target.value;
                        setFormData({ ...formData, features: newFeatures });
                      }}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesManagement;
