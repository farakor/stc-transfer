import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Upload,
  Image as ImageIcon,
  Wifi,
  WifiOff
} from 'lucide-react';
import LicensePlate from '../../components/LicensePlate';
import LicensePlateInput from '../../components/LicensePlateInput';
import { useThrottledApi, useApiQueue } from '../../hooks/useThrottledApi';
import { useResilientApi } from '../../hooks/useApiRetry';

interface Vehicle {
  id: number;
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
    id: number;
    name: string;
    phone: string;
  };
}

interface VehicleInstance {
  license_plate: string;
  status: string;
  driverId?: number | null;
}

interface VehicleFormData {
  type: string;
  name: string;
  brand: string;
  model: string;
  capacity: number;
  pricePerKm: number;
  description: string;
  features: string[];
  quantity: number;
  instances: VehicleInstance[];
  imageUrl: string;
  imageFile: File | null;
}

const VehiclesManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'MAINTENANCE'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SEDAN' | 'PREMIUM' | 'MINIVAN' | 'MICROBUS' | 'BUS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [addingToModel, setAddingToModel] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editingSubVehicle, setEditingSubVehicle] = useState<Vehicle | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupInstances, setGroupInstances] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'retrying'>('connected');
  
  // Используем ref для отслеживания загруженных данных, чтобы избежать перерендеров
  const dataLoadedRef = useRef({ vehicles: false, drivers: false });
  const isInitialLoadRef = useRef(true);
  
  // Используем устойчивый к ошибкам API клиент
  const { makeRequest, isRetrying, retryCount, successRate } = useResilientApi();
  const { enqueue } = useApiQueue(1); // Максимум 1 одновременный запрос для предотвращения rate limiting
  const [formData, setFormData] = useState<VehicleFormData>({
    type: 'SEDAN',
    name: '',
    brand: '',
    model: '',
    capacity: 3,
    pricePerKm: 1500,
    description: '',
    features: [],
    quantity: 1,
    instances: [{ license_plate: '', status: 'AVAILABLE', driverId: null }],
    imageUrl: '',
    imageFile: null
  });

  const fetchVehicles = useCallback(async (force = false) => {
    // Предотвращаем повторную загрузку, если данные уже загружены
    if (dataLoadedRef.current.vehicles && !force) {
      console.log('🚗 Автомобили уже загружены, пропускаем запрос');
      return;
    }

    try {
      console.log('🚗 Начинаем загрузку автомобилей...');
      setLoading(true);
      setConnectionStatus('connected');

      const data = await makeRequest('/api/vehicles/all');

      console.log('📦 Получен ответ от API автомобилей:', data);

      if (data.success && data.data) {
        setVehicles(data.data);
        dataLoadedRef.current.vehicles = true; // Используем ref вместо state
        console.log(`✅ Загружено ${data.data.length} автомобилей`);
        setConnectionStatus('connected');
      } else {
        console.error('❌ API автомобилей вернул ошибку:', data.error);
        setVehicles([]);
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Ошибка при получении автомобилей:', error);
      setVehicles([]);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  const fetchDrivers = useCallback(async (force = false) => {
    // Предотвращаем повторную загрузку, если данные уже загружены
    if (dataLoadedRef.current.drivers && !force) {
      console.log('👥 Водители уже загружены, пропускаем запрос');
      return;
    }

    try {
      setConnectionStatus('connected');
      const data = await makeRequest('/api/users?role=driver');

      if (data.success) {
        setDrivers(data.data || []);
        dataLoadedRef.current.drivers = true; // Используем ref вместо state
        console.log('✅ Водители загружены успешно:', data.data?.length || 0);
      } else {
        console.error('❌ Ошибка загрузки водителей:', data.error);
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('❌ Ошибка при получении водителей:', error);
      setConnectionStatus('error');
    }
  }, [makeRequest]);

  // Throttled версии функций для предотвращения спама запросов
  const throttledFetchVehicles = useThrottledApi(fetchVehicles, { delay: 5000 }); // Увеличиваем до 5 секунд
  const throttledFetchDrivers = useThrottledApi(fetchDrivers, { delay: 5000 }); // Увеличиваем до 5 секунд

  useEffect(() => {
    // Загружаем данные только при первом рендере
    if (!isInitialLoadRef.current) {
      return;
    }
    
    isInitialLoadRef.current = false;
    
    console.log('🔄 Инициализация компонента - начинаем загрузку данных');
    
    // Загружаем данные последовательно с небольшой задержкой
    const loadData = async () => {
      enqueue(async () => {
        await fetchVehicles();
      });
      
      // Увеличиваем задержку перед загрузкой водителей для предотвращения rate limiting
      setTimeout(() => {
        enqueue(async () => {
          await fetchDrivers();
        });
      }, 3000); // Увеличиваем до 3 секунд
    };
    
    loadData();
  }, []); // Пустой массив зависимостей - выполняется только один раз

  const handleCreate = () => {
    setEditingVehicle(null);
    setFormData({
      type: 'SEDAN',
      name: '',
      brand: '',
      model: '',
      capacity: 3,
      pricePerKm: 1500,
      description: '',
      features: [],
      quantity: 1,
      instances: [{ license_plate: '', status: 'AVAILABLE', driverId: null }],
      imageUrl: '',
      imageFile: null
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
      capacity: vehicle.capacity,
      pricePerKm: vehicle.pricePerKm,
      description: vehicle.description || '',
      features: vehicle.features || [],
      quantity: 1,
      instances: [{ license_plate: vehicle.license_plate || '', status: vehicle.status, driverId: vehicle.driver?.id || null }],
      imageUrl: vehicle.imageUrl || '',
      imageFile: null
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Для подчиненного автомобиля проверяем только гос номер
      if (editingSubVehicle) {
        if (!formData.instances[0].license_plate.trim()) {
          alert('Пожалуйста, заполните государственный номер');
          return;
        }

        console.log('💾 Сохранение подчиненного автомобиля:', editingSubVehicle.id, formData.instances[0]);

        await makeRequest(`/api/vehicles/${editingSubVehicle.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            license_plate: formData.instances[0].license_plate,
            status: formData.instances[0].status
          }),
        });

        alert('✅ Экземпляр автомобиля успешно обновлен!');
        setShowModal(false);
        setEditingSubVehicle(null);
        dataLoadedRef.current.vehicles = false; // Сбрасываем флаг перед принудительным обновлением
        fetchVehicles(true);
        return;
      }

      // Проверяем основные поля для главного автомобиля
      if (!formData.brand.trim() || !formData.model.trim()) {
        alert('Пожалуйста, заполните марку и модель');
        return;
      }

      // Проверяем, что все экземпляры имеют гос номера
      const emptyPlates = formData.instances.some(instance => !instance.license_plate.trim());
      if (emptyPlates) {
        alert('Пожалуйста, заполните все государственные номера');
        return;
      }

      console.log('💾 Сохранение автомобилей:', formData);

      // Подготавливаем данные для отправки
      let finalImageUrl = formData.imageUrl;

      // Если есть новый файл изображения, конвертируем его в base64
      if (formData.imageFile) {
        finalImageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(formData.imageFile!);
        });
      }

      if (editingVehicle) {
        // Проверяем, редактируем ли мы группу (все автомобили с тем же названием)
        const groupVehicles = vehicleGroups[editingVehicle.name];

        if (editingGroup) {
          // Редактирование группы - обновляем все экземпляры
          // Обновляем экземпляры последовательно, чтобы не перегружать сервер
          for (let index = 0; index < groupInstances.length; index++) {
            const vehicle = groupInstances[index];
            const instanceData = formData.instances[index];
            const vehicleData = {
              type: formData.type,
              name: formData.name,
              brand: formData.brand,
              model: formData.model,
              capacity: formData.capacity,
              pricePerKm: formData.pricePerKm,
              description: formData.description,
              features: formData.features,
              imageUrl: finalImageUrl,
              // Индивидуальные данные экземпляра
              license_plate: instanceData.license_plate,
              status: instanceData.status,
              driverId: instanceData.driverId
            };

            await makeRequest(`/api/vehicles/${vehicle.id}`, {
              method: 'PUT',
              body: JSON.stringify(vehicleData),
            });
            
            // Увеличиваем задержку между запросами для предотвращения rate limiting
            if (index < groupInstances.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Увеличиваем до 1 секунды
            }
          }

          alert(`✅ Группа "${formData.name}" успешно обновлена (${groupVehicles.length} экземпляров)!`);
        } else {
          // Обновление существующего автомобиля (только один экземпляр)
          const vehicleData = {
            ...formData,
            license_plate: formData.instances[0].license_plate,
            status: formData.instances[0].status,
            driverId: formData.instances[0].driverId,
            imageUrl: finalImageUrl
          };

          await makeRequest(`/api/vehicles/${editingVehicle.id}`, {
            method: 'PUT',
            body: JSON.stringify(vehicleData),
          });

          alert('✅ Автомобиль успешно обновлен!');
        }
      } else {
        // Создание новых автомобилей последовательно
        let successCount = 0;
        for (let index = 0; index < formData.instances.length; index++) {
          const instance = formData.instances[index];
          const vehicleData = {
            ...formData,
            license_plate: instance.license_plate,
            status: instance.status,
            driverId: instance.driverId,
            imageUrl: finalImageUrl
          };

          await makeRequest('/api/vehicles', {
            method: 'POST',
            body: JSON.stringify(vehicleData),
          });
          
          successCount++;
          
          // Увеличиваем задержку между запросами для предотвращения rate limiting
          if (index < formData.instances.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Увеличиваем до 1.5 секунд
          }
        }
        alert(`✅ Успешно добавлено ${successCount} автомобиль${successCount > 1 ? 'ей' : ''}!`);
      }

      setShowModal(false);
      setEditingVehicle(null);
      setEditingGroup(null);
      setGroupInstances([]);
      dataLoadedRef.current.vehicles = false; // Сбрасываем флаг перед принудительным обновлением
      fetchVehicles(true); // Принудительно перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка при сохранении автомобиля:', error);
      alert('❌ Ошибка при сохранении автомобиля');
    }
  };

  const handleDelete = async (vehicleId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      return;
    }

    try {
      await makeRequest(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      alert('✅ Автомобиль удален!');
      dataLoadedRef.current.vehicles = false; // Сбрасываем флаг перед принудительным обновлением
      fetchVehicles(true); // Принудительно перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка при удалении автомобиля:', error);
      alert('❌ Ошибка при удалении автомобиля');
    }
  };

  const handleStatusChange = async (vehicleId: number, newStatus: string) => {
    try {
      await makeRequest(`/api/vehicles/${vehicleId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      alert('✅ Статус автомобиля обновлен!');
      dataLoadedRef.current.vehicles = false; // Сбрасываем флаг перед принудительным обновлением
      fetchVehicles(true); // Принудительно перезагружаем список
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

  const handleQuantityChange = (quantity: number) => {
    const newInstances = Array.from({ length: quantity }, (_, index) =>
      formData.instances[index] || { license_plate: '', status: 'AVAILABLE', driverId: null }
    );

    setFormData({
      ...formData,
      quantity,
      instances: newInstances
    });
  };

  const updateInstance = (index: number, field: keyof VehicleInstance, value: string | number | null) => {
    const newInstances = [...formData.instances];
    newInstances[index] = { ...newInstances[index], [field]: value };
    setFormData({
      ...formData,
      instances: newInstances
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      // Создаем URL для предпросмотра
      const imageUrl = URL.createObjectURL(file);

      setFormData({
        ...formData,
        imageFile: file,
        imageUrl: imageUrl
      });
    }
  };

  const removeImage = () => {
    if (formData.imageUrl && formData.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageUrl);
    }

    setFormData({
      ...formData,
      imageFile: null,
      imageUrl: ''
    });
  };

  const handleAddMoreInstances = (vehicleName: string) => {
    // Находим первый автомобиль с таким названием для копирования данных
    const existingVehicle = vehicles.find(v => v.name === vehicleName);
    if (!existingVehicle) return;

    setAddingToModel(vehicleName);
    setFormData({
      type: existingVehicle.type,
      name: existingVehicle.name,
      brand: existingVehicle.brand || '',
      model: existingVehicle.model || '',
      capacity: existingVehicle.capacity,
      pricePerKm: existingVehicle.pricePerKm,
      description: existingVehicle.description || '',
      features: existingVehicle.features || [],
      quantity: 1,
      instances: [{ license_plate: '', status: 'AVAILABLE', driverId: null }],
      imageUrl: existingVehicle.imageUrl || '',
      imageFile: null
    });
    setShowAddMoreModal(true);
  };

  const toggleGroupExpansion = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleEditSubVehicle = (vehicle: Vehicle) => {
    setEditingSubVehicle(vehicle);
    setFormData({
      type: vehicle.type,
      name: vehicle.name,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      capacity: vehicle.capacity,
      pricePerKm: vehicle.pricePerKm,
      description: vehicle.description || '',
      features: vehicle.features || [],
      quantity: 1,
      instances: [{ license_plate: vehicle.license_plate || '', status: vehicle.status, driverId: vehicle.driver?.id || null }],
      imageUrl: vehicle.imageUrl || '',
      imageFile: null
    });
    setShowModal(true);
  };

  const handleEditGroup = (vehicleName: string) => {
    // Находим все автомобили в группе
    const groupVehicles = vehicleGroups[vehicleName];
    if (!groupVehicles || groupVehicles.length === 0) return;

    const groupInfo = groupVehicles[0];
    setEditingGroup(vehicleName);
    setGroupInstances([...groupVehicles]); // Копируем все экземпляры группы
    setEditingVehicle(groupInfo); // Используем как базу для редактирования группы

    setFormData({
      type: groupInfo.type,
      name: groupInfo.name,
      brand: groupInfo.brand || '',
      model: groupInfo.model || '',
      capacity: groupInfo.capacity,
      pricePerKm: groupInfo.pricePerKm,
      description: groupInfo.description || '',
      features: groupInfo.features || [],
      quantity: groupVehicles.length,
      instances: groupVehicles.map(vehicle => ({
        license_plate: vehicle.license_plate || '',
        status: vehicle.status,
        driverId: vehicle.driver?.id || null
      })),
      imageUrl: groupInfo.imageUrl || '',
      imageFile: null
    });
    setShowModal(true);
  };

  const handleDeleteGroup = async (vehicleName: string) => {
    const groupVehicles = vehicleGroups[vehicleName];
    if (!groupVehicles || groupVehicles.length === 0) return;

    const confirmMessage = `Вы уверены, что хотите удалить всю группу "${vehicleName}" (${groupVehicles.length} экземпляров)?`;
    if (!confirm(confirmMessage)) return;

    try {
      // Удаляем все автомобили в группе последовательно
      for (let index = 0; index < groupVehicles.length; index++) {
        const vehicle = groupVehicles[index];
        await makeRequest(`/api/vehicles/${vehicle.id}`, { method: 'DELETE' });
        
        // Увеличиваем задержку между запросами для предотвращения rate limiting
        if (index < groupVehicles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Увеличиваем до 1 секунды
        }
      }

      alert(`✅ Группа "${vehicleName}" успешно удалена (${groupVehicles.length} экземпляров)!`);
      dataLoadedRef.current.vehicles = false; // Сбрасываем флаг перед принудительным обновлением
      fetchVehicles(true); // Принудительно перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка при удалении группы:', error);
      alert('❌ Ошибка при удалении группы');
    }
  };

  const handleSaveMoreInstances = async () => {
    try {
      // Проверяем, что все экземпляры имеют гос номера
      const emptyPlates = formData.instances.some(instance => !instance.license_plate.trim());
      if (emptyPlates) {
        alert('Пожалуйста, заполните все государственные номера');
        return;
      }

      console.log('💾 Добавление экземпляров к модели:', addingToModel, formData);

      // Создание новых экземпляров последовательно
      let successCount = 0;
      for (let index = 0; index < formData.instances.length; index++) {
        const instance = formData.instances[index];
        const vehicleData = {
          ...formData,
          license_plate: instance.license_plate,
          status: instance.status,
          driverId: instance.driverId
        };

        await makeRequest('/api/vehicles', {
          method: 'POST',
          body: JSON.stringify(vehicleData),
        });
        
        successCount++;
        
        // Увеличиваем задержку между запросами для предотвращения rate limiting
        if (index < formData.instances.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // Увеличиваем до 1.5 секунд
        }
      }
      alert(`✅ Успешно добавлено ${successCount} экземпляр${successCount > 1 ? 'ов' : ''} к модели ${addingToModel}!`);

      setShowAddMoreModal(false);
      setAddingToModel(null);
      dataLoadedRef.current.vehicles = false; // Сбрасываем флаг перед принудительным обновлением
      fetchVehicles(true); // Принудительно перезагружаем список
    } catch (error) {
      console.error('❌ Ошибка при добавлении экземпляров:', error);
      alert('❌ Ошибка при добавлении экземпляров');
    }
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

  // Группируем автомобили по названию для отображения кнопки "Добавить еще"
  const vehicleGroups = filteredVehicles.reduce((groups, vehicle) => {
    const key = vehicle.name;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(vehicle);
    return groups;
  }, {} as Record<string, Vehicle[]>);

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
            onClick={() => {
              dataLoadedRef.current.vehicles = false; // Сбрасываем флаг
              throttledFetchVehicles(true);
            }}
            disabled={isRetrying}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isRetrying 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? `Повтор ${retryCount + 1}...` : 'Обновить'}
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

      {/* Индикатор состояния подключения */}
      {(isRetrying || connectionStatus === 'error') && (
        <div className={`rounded-lg p-4 mb-4 ${
          isRetrying ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isRetrying ? (
                <Wifi className="w-5 h-5 text-yellow-600 animate-pulse" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                isRetrying ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {isRetrying 
                  ? `Переподключение... (попытка ${retryCount + 1})`
                  : 'Проблемы с подключением к серверу'
                }
              </p>
              <p className={`text-xs ${
                isRetrying ? 'text-yellow-600' : 'text-red-600'
              }`}>
                Успешность запросов: {successRate}%
              </p>
            </div>
          </div>
        </div>
      )}

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
              {Object.entries(vehicleGroups).map(([vehicleName, vehiclesInGroup]) => {
                const groupInfo = vehiclesInGroup[0]; // Берем данные для группы из первого автомобиля
                const isExpanded = expandedGroups.has(vehicleName);

                return (
                  <React.Fragment key={vehicleName}>
                    {/* Заголовок группы */}
                    <tr className="hover:bg-blue-50 bg-blue-25 border-l-4 border-blue-500">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium text-gray-900 flex items-center">
                              {groupInfo.brand} {groupInfo.model}
                              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {vehiclesInGroup.length}
                              </span>
                              <button
                                onClick={() => toggleGroupExpansion(vehicleName)}
                                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                                title={isExpanded ? "Свернуть экземпляры" : "Показать экземпляры"}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                            <div className="text-sm text-gray-600">
                              Модель автомобиля
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(groupInfo.type)}`}>
                            {getTypeText(groupInfo.type)}
                          </span>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {groupInfo.capacity} мест
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">—</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-500">
                          {vehiclesInGroup.filter(v => v.status === 'AVAILABLE').length} доступно
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {groupInfo.pricePerKm.toLocaleString()} сум/км
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAddMoreInstances(vehicleName)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Добавить еще экземпляры"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditGroup(vehicleName)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Редактировать параметры группы"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(vehicleName)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Удалить всю группу"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Экземпляры автомобилей */}
                    {isExpanded && vehiclesInGroup.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50 bg-gray-25 border-l-4 border-gray-300">
                        <td className="py-2 px-4 pl-12">
                          <div className="flex items-center space-x-3">
                            <LicensePlate plateNumber={vehicle.license_plate} size="small" />
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="text-xs text-gray-400">
                            —
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          {vehicle.driver ? (
                            <div>
                              <div className="text-xs font-medium text-gray-700">
                                {vehicle.driver.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {vehicle.driver.phone}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Не назначен</span>
                          )}
                        </td>
                        <td className="py-2 px-4">
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
                        <td className="py-2 px-4">
                          <div className="text-xs text-gray-400">
                            —
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Удалить экземпляр"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
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
                {editingSubVehicle ? 'Редактировать экземпляр автомобиля' :
                  editingVehicle ? (vehicleGroups[editingVehicle.name]?.length > 1 ? 'Редактировать группу автомобилей' : 'Редактировать автомобиль') : 'Добавить автомобиль'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Информация о модели (только для подчиненного автомобиля) */}
            {editingSubVehicle && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Car className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-800">
                      {formData.brand} {formData.model}
                    </p>
                    <p className="text-xs text-orange-600">
                      Редактируется только госномер и статус экземпляра
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Основная информация (скрыта для подчиненного автомобиля) */}
            {!editingSubVehicle && (
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

                {!editingVehicle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Количество автомобилей *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {!editingSubVehicle && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фотография автомобиля
                </label>

                {formData.imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={formData.imageUrl}
                        alt="Предпросмотр"
                        className="w-32 h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="Удалить изображение"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        Заменить фото
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Загрузить фото
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF до 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {/* Экземпляры автомобилей */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editingGroup ? `Экземпляры группы (${formData.quantity} шт.)` :
                  editingVehicle ? 'Данные автомобиля' : `Данные автомобилей (${formData.quantity} шт.)`}
              </label>
              <div className="space-y-3">
                {formData.instances.map((instance, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Экземпляр {index + 1}
                      </span>
                      {editingGroup && groupInstances[index] && (
                        <span className="text-xs text-gray-500">
                          (ID: {groupInstances[index].id})
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Государственный номер *
                        </label>
                        <LicensePlateInput
                          value={instance.license_plate}
                          onChange={(value) => updateInstance(index, 'license_plate', value)}
                          placeholder="01 A123BC"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Статус
                        </label>
                        <select
                          value={instance.status}
                          onChange={(e) => updateInstance(index, 'status', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="AVAILABLE">Доступен</option>
                          <option value="BUSY">Занят</option>
                          <option value="MAINTENANCE">На обслуживании</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Водитель
                        </label>
                        <select
                          value={instance.driverId || ''}
                          onChange={(e) => updateInstance(index, 'driverId', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Не назначен</option>
                          {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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

      {/* Модал добавления экземпляров к существующей модели */}
      {showAddMoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Добавить экземпляры к модели: {addingToModel}
              </h3>
              <button
                onClick={() => setShowAddMoreModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    {formData.brand} {formData.model}
                  </p>
                  <p className="text-xs text-blue-600">
                    Все характеристики будут скопированы из существующей модели
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество новых экземпляров *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
                required
              />
            </div>

            {/* Экземпляры автомобилей */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Данные новых экземпляров ({formData.quantity} шт.)
              </label>
              <div className="space-y-3">
                {formData.instances.map((instance, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Экземпляр {index + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Государственный номер *
                        </label>
                        <LicensePlateInput
                          value={instance.license_plate}
                          onChange={(value) => updateInstance(index, 'license_plate', value)}
                          placeholder="01 A123BC"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Статус
                        </label>
                        <select
                          value={instance.status}
                          onChange={(e) => updateInstance(index, 'status', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="AVAILABLE">Доступен</option>
                          <option value="BUSY">Занят</option>
                          <option value="MAINTENANCE">На обслуживании</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMoreModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveMoreInstances}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить экземпляры
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesManagement;
