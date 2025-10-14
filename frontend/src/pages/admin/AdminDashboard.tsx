import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Users,
  Car,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';
import { BookingStats } from '../../types/admin';
import { adminService } from '../../services/adminService';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import VehicleTrackingMapJsonp from '../../components/VehicleTrackingMapJsonp';
import { wialonConfig, defaultMapSettings } from '../../config/wialon.config';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBookingStats(period);
      console.log('📊 Получена статистика:', response);
      console.log('📊 response.data:', response.data);
      
      // Проверяем структуру ответа
      if (response && response.data) {
        setStats(response.data);
      } else if (response) {
        // Возможно данные приходят напрямую без обертки .data
        setStats(response as any);
      }
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatCards = (): StatCard[] => {
    if (!stats || !stats.statusStats || !Array.isArray(stats.statusStats)) return [];

    const totalBookings = stats.statusStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const completedBookings = stats.statusStats.find(s => s.status === 'COMPLETED')?._count.status || 0;
    const pendingBookings = stats.statusStats.find(s => s.status === 'PENDING')?._count.status || 0;
    const cancelledBookings = stats.statusStats.find(s => s.status === 'CANCELLED')?._count.status || 0;

    return [
      {
        title: 'Всего заказов',
        value: totalBookings,
        icon: <CalendarDays className="w-6 h-6" />,
        color: 'bg-blue-500',
      },
      {
        title: 'Завершенные',
        value: completedBookings,
        icon: <CheckCircle className="w-6 h-6" />,
        color: 'bg-green-500',
      },
      {
        title: 'В ожидании',
        value: pendingBookings,
        icon: <Clock className="w-6 h-6" />,
        color: 'bg-yellow-500',
      },
      {
        title: 'Отмененные',
        value: cancelledBookings,
        icon: <XCircle className="w-6 h-6" />,
        color: 'bg-red-500',
      },
      {
        title: 'Выручка',
        value: `${(Number(stats.totalRevenue) / 1000).toFixed(0)}k сум`,
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'bg-purple-500',
      },
    ];
  };

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case 'day': return 'Сегодня';
      case 'week': return 'За неделю';
      case 'month': return 'За месяц';
      default: return 'Сегодня';
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Панель диспетчера</h1>
          <p className="text-gray-600 mt-1">Добро пожаловать в систему управления заказами</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Переключатель режима просмотра */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Обзор
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Аналитика
            </button>
          </div>

          {/* Переключатель периода */}
          {viewMode === 'overview' && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['day', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === p
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {getPeriodLabel(p)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Контент в зависимости от режима */}
      {viewMode === 'overview' ? (
        <>
          {/* Карточки статистики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {getStatCards().map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    {card.change && (
                      <p className={`text-sm mt-1 ${card.changeType === 'positive' ? 'text-green-600' :
                        card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {card.change}
                      </p>
                    )}
                  </div>
                  <div className={`${card.color} text-white p-3 rounded-lg`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Уведомления */}
          {stats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Уведомления</h2>
              <div className="space-y-3">
                {stats.statusStats.find(s => s.status === 'PENDING')?._count.status > 0 && (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-yellow-800 font-medium">
                        {stats.statusStats.find(s => s.status === 'PENDING')?._count.status} заказов ожидают обработки
                      </p>
                      <p className="text-yellow-700 text-sm">Требуется назначение водителей</p>
                    </div>
                  </div>
                )}

                {!stats.statusStats.length && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Нет активных уведомлений</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Карта мониторинга транспорта */}
          <div className="mt-6">
            <VehicleTrackingMapJsonp
              height="600px"
              wialonConfig={wialonConfig}
              refreshInterval={defaultMapSettings.refreshInterval}
              showControls={true}
            />
          </div>

          {/* Быстрые действия */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => window.location.href = '/admin/bookings'}
                className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <CalendarDays className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-700 font-medium">Управление заказами</span>
              </button>

              <button
                onClick={() => window.location.href = '/admin/drivers'}
                className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <Users className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">Водители</span>
              </button>

              <button
                onClick={() => window.location.href = '/admin/vehicles'}
                className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <Car className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-purple-700 font-medium">Транспорт</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <AnalyticsDashboard />
      )}
    </div>
  );
};

export default AdminDashboard;
