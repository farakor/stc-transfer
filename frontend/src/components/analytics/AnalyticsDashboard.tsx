import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  MapPin,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Settings
} from 'lucide-react';
import RevenueChart from './RevenueChart';
import OrdersStatusChart from './OrdersStatusChart';
import PopularRoutesChart from './PopularRoutesChart';
import DriverPerformanceChart from './DriverPerformanceChart';
import RealTimeMetrics from './RealTimeMetrics';
import { adminService } from '../../services/adminService';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'orders' | 'routes' | 'drivers'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Моковые данные для демонстрации
  const [revenueData] = useState([
    { date: '2024-01-01', revenue: 1250000, orders: 45 },
    { date: '2024-01-02', revenue: 1580000, orders: 52 },
    { date: '2024-01-03', revenue: 1320000, orders: 48 },
    { date: '2024-01-04', revenue: 1750000, orders: 61 },
    { date: '2024-01-05', revenue: 1420000, orders: 49 },
    { date: '2024-01-06', revenue: 1680000, orders: 58 },
    { date: '2024-01-07', revenue: 1890000, orders: 67 }
  ]);

  const [statusData] = useState([
    { status: 'COMPLETED' as const, count: 234, percentage: 65.2 },
    { status: 'PENDING' as const, count: 45, percentage: 12.5 },
    { status: 'IN_PROGRESS' as const, count: 38, percentage: 10.6 },
    { status: 'CONFIRMED' as const, count: 32, percentage: 8.9 },
    { status: 'CANCELLED' as const, count: 10, percentage: 2.8 }
  ]);

  const [routesData] = useState([
    { route: 'tashkent-samarkand', from: 'Ташкент', to: 'Самарканд', count: 156, revenue: 4680000, avgPrice: 30000 },
    { route: 'tashkent-bukhara', from: 'Ташкент', to: 'Бухара', count: 134, revenue: 4020000, avgPrice: 30000 },
    { route: 'samarkand-bukhara', from: 'Самарканд', to: 'Бухара', count: 98, revenue: 2450000, avgPrice: 25000 },
    { route: 'tashkent-fergana', from: 'Ташкент', to: 'Фергана', count: 87, revenue: 2610000, avgPrice: 30000 },
    { route: 'tashkent-namangan', from: 'Ташкент', to: 'Наманган', count: 76, revenue: 2280000, avgPrice: 30000 },
    { route: 'bukhara-khiva', from: 'Бухара', to: 'Хива', count: 65, revenue: 1625000, avgPrice: 25000 },
    { route: 'tashkent-andijan', from: 'Ташкент', to: 'Андижан', count: 54, revenue: 1620000, avgPrice: 30000 },
    { route: 'samarkand-tashkent', from: 'Самарканд', to: 'Ташкент', count: 52, revenue: 1560000, avgPrice: 30000 }
  ]);

  const [driversData] = useState([
    { driverId: '1', name: 'Ибрагим Азизов', completedOrders: 89, totalRevenue: 2670000, avgRating: 4.8, avgResponseTime: 3, efficiency: 94.7 },
    { driverId: '2', name: 'Азиз Рахимов', completedOrders: 76, totalRevenue: 2280000, avgRating: 4.6, avgResponseTime: 4, efficiency: 91.6 },
    { driverId: '3', name: 'Шерзод Каримов', completedOrders: 68, totalRevenue: 2040000, avgRating: 4.7, avgResponseTime: 5, efficiency: 89.5 },
    { driverId: '4', name: 'Фарход Усманов', completedOrders: 62, totalRevenue: 1860000, avgRating: 4.5, avgResponseTime: 6, efficiency: 87.3 },
    { driverId: '5', name: 'Бахтиёр Юсупов', completedOrders: 58, totalRevenue: 1740000, avgRating: 4.4, avgResponseTime: 7, efficiency: 85.2 }
  ]);

  const [realTimeData] = useState({
    activeOrders: 23,
    availableDrivers: 12,
    busyDrivers: 8,
    avgResponseTime: 4,
    pendingOrders: 5,
    completionRate: 92.5,
    currentRevenue: 3450000,
    ordersPerHour: 8
  });

  useEffect(() => {
    // Имитация загрузки данных
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [period]);

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: Activity },
    { id: 'revenue', name: 'Выручка', icon: TrendingUp },
    { id: 'orders', name: 'Заказы', icon: BarChart3 },
    { id: 'routes', name: 'Маршруты', icon: MapPin },
    { id: 'drivers', name: 'Водители', icon: Users }
  ];

  const handleExportData = () => {
    // Логика экспорта данных
    console.log('Экспорт данных за период:', period);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Логика обновления данных
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок и управление */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Аналитический дашборд</h2>
          <p className="text-gray-600">Детальная аналитика и метрики системы</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Переключатель периода */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${period === p
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : 'Месяц'}
              </button>
            ))}
          </div>

          {/* Кнопки управления */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </button>
        </div>
      </div>

      {/* Метрики в реальном времени */}
      <RealTimeMetrics
        data={realTimeData}
        loading={loading}
        autoRefresh={autoRefresh}
      />

      {/* Вкладки */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Контент вкладок */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RevenueChart data={revenueData} period={period} loading={loading} />
            <OrdersStatusChart data={statusData} loading={loading} />
            <PopularRoutesChart data={routesData} loading={loading} />
            <DriverPerformanceChart data={driversData} loading={loading} metric="orders" />
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <RevenueChart data={revenueData} period={period} loading={loading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopularRoutesChart data={routesData} loading={loading} showRevenue={true} />
              <DriverPerformanceChart data={driversData} loading={loading} metric="revenue" />
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OrdersStatusChart data={statusData} loading={loading} chartType="pie" />
              <OrdersStatusChart data={statusData} loading={loading} chartType="bar" />
            </div>
            <PopularRoutesChart data={routesData} loading={loading} />
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="space-y-6">
            <PopularRoutesChart data={routesData} loading={loading} />
            <PopularRoutesChart data={routesData} loading={loading} showRevenue={true} />
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DriverPerformanceChart data={driversData} loading={loading} metric="orders" />
              <DriverPerformanceChart data={driversData} loading={loading} metric="rating" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DriverPerformanceChart data={driversData} loading={loading} metric="revenue" />
              <DriverPerformanceChart data={driversData} loading={loading} metric="efficiency" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
