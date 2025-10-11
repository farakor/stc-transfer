import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { wialonJsonpService } from '../services/wialonJsonpService';
import { wialonConfig } from '../config/wialon.config';
import api from '../services/api';

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

interface WialonMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: {
    id: number;
    name: string;
    brand?: string;
    model?: string;
    license_plate?: string;
    wialonUnitId?: string | null;
  };
  onSuccess?: () => void;
}

const WialonMappingModal: React.FC<WialonMappingModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSuccess
}) => {
  const [wialonUnits, setWialonUnits] = useState<WialonUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(vehicle.wialonUnitId || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadWialonUnits();
    }
  }, [isOpen]);

  const loadWialonUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🚗 Loading Wialon units via JSONP...');
      
      // Инициализируем JSONP сервис
      wialonJsonpService.initialize(wialonConfig);
      
      // Авторизуемся если еще не авторизованы
      if (!wialonJsonpService.isAuthenticated()) {
        console.log('🔐 Logging in to Wialon...');
        await wialonJsonpService.login();
      }
      
      // Получаем units через JSONP
      const vehicles = await wialonJsonpService.getVehicles();
      
      console.log(`✅ Loaded ${vehicles.length} units from Wialon`);
      
      // Преобразуем в наш формат
      const units: WialonUnit[] = vehicles.map((v: any) => {
        const pos = v.pos;
        const now = Math.floor(Date.now() / 1000);
        
        let status: 'online' | 'offline' | 'moving' | 'stopped' = 'offline';
        
        if (pos && (now - pos.t) < 600) {
          const speed = pos.s || 0;
          status = speed > 5 ? 'moving' : 'stopped';
        }
        
        return {
          id: v.id.toString(),
          name: v.nm || `Unit ${v.id}`,
          position: pos ? {
            lat: pos.y,
            lng: pos.x,
            speed: pos.s || 0,
            course: pos.c || 0,
            time: pos.t || 0
          } : undefined,
          status
        };
      });
      
      setWialonUnits(units);
    } catch (err: any) {
      console.error('Failed to load Wialon units:', err);
      setError(`Не удалось загрузить список транспорта: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Сохраняем связь через backend API
      await api.put(`/vehicles/${vehicle.id}/wialon`, { wialonUnitId: selectedUnitId });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to save Wialon mapping:', err);
      setError(`Не удалось связать автомобиль: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async () => {
    setSaving(true);
    setError(null);
    try {
      // Отвязываем через backend API
      await api.put(`/vehicles/${vehicle.id}/wialon`, { wialonUnitId: null });
      setSelectedUnitId(null);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to unlink Wialon unit:', err);
      setError(`Не удалось отвязать автомобиль: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredUnits = wialonUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.id.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Связь с Wialon</h2>
            <p className="text-sm text-gray-600 mt-1">
              {vehicle.name} {vehicle.brand && `${vehicle.brand}`} {vehicle.model && `${vehicle.model}`}
              {vehicle.license_plate && ` • ${vehicle.license_plate}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Текущая связь */}
          {vehicle.wialonUnitId && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-green-900">Связан с Wialon</p>
                    <p className="text-sm text-green-700">Unit ID: {vehicle.wialonUnitId}</p>
                  </div>
                </div>
                <button
                  onClick={handleUnlink}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Отвязка...' : 'Отвязать'}
                </button>
              </div>
            </div>
          )}

          {/* Поиск */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Поиск по названию или ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={loadWialonUnits}
                disabled={loading}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Обновить список"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Список единиц */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
                <p className="text-gray-600">Загрузка списка транспорта...</p>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchTerm ? 'Ничего не найдено' : 'Нет доступных единиц транспорта'}
                </p>
              </div>
            ) : (
              filteredUnits.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    selectedUnitId === unit.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{unit.name}</p>
                      <p className="text-sm text-gray-600">ID: {unit.id}</p>
                      {unit.position && (
                        <p className="text-xs text-gray-500 mt-1">
                          {unit.status === 'moving' && '🚗 В движении'}
                          {unit.status === 'stopped' && '⏸️ Остановка'}
                          {unit.status === 'offline' && '📵 Оффлайн'}
                          {unit.position.speed && ` • ${Math.round(unit.position.speed)} км/ч`}
                        </p>
                      )}
                    </div>
                    {selectedUnitId === unit.id && (
                      <CheckCircle className="text-green-600" size={24} />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Футер */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedUnitId || selectedUnitId === vehicle.wialonUnitId}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <LinkIcon size={18} />
            {saving ? 'Сохранение...' : 'Связать'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WialonMappingModal;

