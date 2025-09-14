import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Car,
  Phone,
  User,
  MapPin,
  RefreshCw,
  X,
  Save
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Vehicle {
  id: string;
  brand?: string;
  model?: string;
  license_plate?: string;
  type: string;
  name: string;
  status: string;
}

interface DriverFormData {
  name: string;
  phone: string;
  license: string;
  vehicleId?: string;
}

const DriversManagement: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'OFFLINE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    phone: '',
    license: '',
    vehicleId: ''
  });

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    try {
      console.log('📋 Начинаем загрузку водителей...');
      setLoading(true);

      // Используем реальный API endpoint
      const response = await fetch('/api/admin/drivers');
      const data = await response.json();

      console.log('📦 Получен ответ от API водителей:', data);

      if (data.success && data.data) {
        setDrivers(data.data);
        console.log(`✅ Загружено ${data.data.length} водителей`);
      } else {
        console.error('❌ API вернул ошибку:', data.error);
        // Если API не работает, используем заглушку
        const mockDrivers: Driver[] = [
          {
            id: '1',
            name: 'Ибрагим Азизов',
            phone: '+998 90 123 45 67',
            license: 'AB1234567',
            status: 'AVAILABLE',
            vehicle: {
              id: '1',
              brand: 'Hongqi',
              model: 'EHS5',
              licensePlate: '01 A 123 BC',
              type: 'SEDAN'
            },
            createdAt: '2025-01-15T10:30:00Z',
            updatedAt: '2025-01-15T10:30:00Z'
          }
        ];
        setDrivers(mockDrivers);
      }
    } catch (error) {
      console.error('❌ Ошибка при получении водителей:', error);
      // Fallback к заглушке при ошибке сети
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      console.log('🚗 Начинаем загрузку автомобилей...');

      // Используем реальный API endpoint
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
    }
  };

  const handleCreate = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      license: '',
      vehicleId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      license: driver.license,
      vehicleId: driver.vehicle?.id || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.license.trim()) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      console.log('💾 Сохранение водителя:', formData);

      if (editingDriver) {
        // Обновление существующего водителя
        console.log('🔄 Обновление водителя через API...');
        const response = await fetch(`/api/admin/drivers/${editingDriver.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            license: formData.license,
            vehicleId: formData.vehicleId || null
          }),
        });

        const result = await response.json();
        console.log('📦 Ответ API обновления водителя:', result);

        if (result.success) {
          // Обновляем локальное состояние
          const updatedDrivers = drivers.map(driver => {
            if (driver.id === editingDriver.id) {
              const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
              return {
                ...driver,
                name: formData.name,
                phone: formData.phone,
                license: formData.license,
                vehicle: selectedVehicle ? {
                  id: selectedVehicle.id,
                  brand: selectedVehicle.brand || '',
                  model: selectedVehicle.model || '',
                  licensePlate: selectedVehicle.license_plate || '',
                  type: selectedVehicle.type
                } : undefined,
                updatedAt: new Date().toISOString()
              };
            }
            return driver;
          });
          setDrivers(updatedDrivers);
          alert('✅ Водитель успешно обновлен!');
        } else {
          throw new Error(result.error || 'Ошибка при обновлении водителя');
        }
      } else {
        // Создание нового водителя
        console.log('➕ Создание нового водителя через API...');
        const response = await fetch('/api/admin/drivers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            license: formData.license,
            vehicleId: formData.vehicleId || null
          }),
        });

        const result = await response.json();
        console.log('📦 Ответ API создания водителя:', result);

        if (result.success) {
          // Добавляем нового водителя в локальное состояние
          const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
          const newDriver: Driver = {
            id: result.data.id,
            name: result.data.name,
            phone: result.data.phone,
            license: result.data.license,
            status: result.data.status,
            vehicle: selectedVehicle ? {
              id: selectedVehicle.id,
              brand: selectedVehicle.brand || '',
              model: selectedVehicle.model || '',
              licensePlate: selectedVehicle.license_plate || '',
              type: selectedVehicle.type
            } : undefined,
            createdAt: result.data.createdAt,
            updatedAt: result.data.createdAt
          };
          setDrivers([...drivers, newDriver]);
          alert('✅ Водитель успешно добавлен в базу данных!');
        } else {
          throw new Error(result.error || 'Ошибка при создании водителя');
        }
      }

      // Сбрасываем форму и закрываем модал
      setFormData({
        name: '',
        phone: '',
        license: '',
        vehicleId: ''
      });
      setEditingDriver(null);
      setShowModal(false);
    } catch (error) {
      console.error('❌ Ошибка при сохранении водителя:', error);
      alert(`❌ Ошибка при сохранении водителя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleDelete = async (driverId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого водителя?')) {
      return;
    }

    try {
      console.log('🗑️ Удаление водителя через API:', driverId);
      const response = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      console.log('📦 Ответ API удаления водителя:', result);

      if (result.success) {
        setDrivers(drivers.filter(driver => driver.id !== driverId));
        alert('✅ Водитель удален из базы данных!');
      } else {
        throw new Error(result.error || 'Ошибка при удалении водителя');
      }
    } catch (error) {
      console.error('❌ Ошибка при удалении водителя:', error);
      alert(`❌ Ошибка при удалении водителя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OFFLINE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Доступен';
      case 'BUSY': return 'Занят';
      case 'OFFLINE': return 'Не в сети';
      default: return status;
    }
  };

  const getAvailableVehicles = () => {
    // Показываем автомобили, которые не назначены другим водителям или назначены текущему редактируемому
    const assignedVehicleIds = drivers
      .filter(d => d.vehicle && (!editingDriver || d.id !== editingDriver.id))
      .map(d => d.vehicle!.id);

    return vehicles.filter(v => !assignedVehicleIds.includes(v.id));
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesFilter = filter === 'ALL' || driver.status === filter;
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Управление водителями</h1>
          <p className="text-gray-600 mt-1">Управление водителями и назначение автомобилей</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchDrivers}
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
            Добавить водителя
          </button>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени, телефону, автомобилю..."
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
              <option value="OFFLINE">Не в сети</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список водителей */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Водитель</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Контакты</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Автомобиль</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Статус</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Лицензия</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-600">ID: {driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{driver.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {driver.vehicle ? (
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {driver.vehicle.brand} {driver.vehicle.model}
                          </div>
                          <div className="text-sm text-gray-600">
                            {driver.vehicle.licensePlate}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Не назначен</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(driver.status)}`}>
                      {getStatusText(driver.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-600">{driver.license}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
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

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Водители не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры или добавить нового водителя</p>
          </div>
        )}
      </div>

      {/* Модал создания/редактирования водителя */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingDriver ? 'Редактировать водителя' : 'Добавить водителя'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ФИО *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите полное имя"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+998 90 123 45 67"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Водительские права *
                </label>
                <input
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AB1234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Автомобиль
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Не назначен</option>
                  {getAvailableVehicles().map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Показаны только свободные автомобили
                </p>
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

export default DriversManagement;
