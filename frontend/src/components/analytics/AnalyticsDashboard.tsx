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

  // Реальные данные из API
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [routesData, setRoutesData] = useState<any[]>([]);
  const [driversData, setDriversData] = useState<any[]>([]);
  const [realTimeData, setRealTimeData] = useState<any>({
    activeOrders: 0,
    availableDrivers: 0,
    busyDrivers: 0,
    avgResponseTime: 0,
    pendingOrders: 0,
    completionRate: 0,
    currentRevenue: 0,
    ordersPerHour: 0
  });

  // Загрузка данных
  useEffect(() => {
    fetchAllData();
  }, [period]);

  // Автообновление данных
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRealTimeData();
    }, 30000); // Обновление каждые 30 секунд

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRevenueData(),
        fetchStatusData(),
        fetchRoutesData(),
        fetchDriversData(),
        fetchRealTimeData()
      ]);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      console.log('📊 Запрос данных о выручке, период:', period);
      const response = await adminService.getRevenueAnalytics(period);
      console.log('📊 Ответ выручки:', response);
      console.log('📊 response.data:', response.data);
      
      // Axios возвращает {data: {...}}, внутри которого наш {success, data}
      const apiResponse = response.data;
      if (apiResponse && apiResponse.success && apiResponse.data) {
        console.log('📊 Данные выручки:', apiResponse.data);
        // Форматируем данные для графика
        const dailyData = apiResponse.data.dailyData || [];
        console.log('📊 Daily data:', dailyData);
        const formattedData = dailyData.map((item: any) => ({
          date: item.date,
          revenue: Number(item.revenue || 0),
          orders: Number(item.bookings || 0)
        }));
        console.log('📊 Форматированные данные выручки:', formattedData);
        setRevenueData(formattedData);
      } else {
        console.warn('📊 Неверный формат ответа выручки:', apiResponse);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных о выручке:', error);
      setRevenueData([]);
    }
  };

  const fetchStatusData = async () => {
    try {
      console.log('📊 Запрос данных о статусах, период:', period);
      const response = await adminService.getOrdersStatusData(period);
      console.log('📊 Ответ статусов:', response);
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.success && apiResponse.data) {
        console.log('📊 Данные статусов:', apiResponse.data);
        setStatusData(apiResponse.data);
      } else {
        console.warn('📊 Неверный формат ответа статусов:', apiResponse);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных о статусах:', error);
      setStatusData([]);
    }
  };

  const fetchRoutesData = async () => {
    try {
      console.log('📊 Запрос популярных маршрутов...');
      const response = await adminService.getPopularRoutes();
      console.log('📊 Ответ маршрутов:', response);
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.success && apiResponse.data) {
        console.log('📊 Данные маршрутов:', apiResponse.data);
        // Форматируем данные для графика
        const formattedData = apiResponse.data.map((item: any) => ({
          route: `${item.fromLocation}-${item.toLocation}`,
          from: item.fromLocation,
          to: item.toLocation,
          count: item.bookingsCount,
          revenue: Number(item.totalRevenue || 0),
          avgPrice: item.bookingsCount > 0 ? Math.round(Number(item.totalRevenue || 0) / item.bookingsCount) : 0
        }));
        console.log('📊 Форматированные данные маршрутов:', formattedData);
        setRoutesData(formattedData);
      } else {
        console.warn('📊 Неверный формат ответа маршрутов:', apiResponse);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных о маршрутах:', error);
      setRoutesData([]);
    }
  };

  const fetchDriversData = async () => {
    try {
      console.log('📊 Запрос производительности водителей...');
      const response = await adminService.getDriverPerformance();
      console.log('📊 Ответ водителей:', response);
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.success && apiResponse.data) {
        console.log('📊 Данные водителей:', apiResponse.data);
        setDriversData(apiResponse.data);
      } else {
        console.warn('📊 Неверный формат ответа водителей:', apiResponse);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных о водителях:', error);
      setDriversData([]);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      console.log('📊 Запрос метрик в реальном времени...');
      const response = await adminService.getRealTimeMetrics();
      console.log('📊 Ответ метрик:', response);
      
      const apiResponse = response.data;
      if (apiResponse && apiResponse.success && apiResponse.data) {
        console.log('📊 Метрики в реальном времени:', apiResponse.data);
        setRealTimeData(apiResponse.data);
      } else {
        console.warn('📊 Неверный формат ответа метрик:', apiResponse);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки метрик в реальном времени:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: Activity },
    { id: 'revenue', name: 'Выручка', icon: TrendingUp },
    { id: 'orders', name: 'Заказы', icon: BarChart3 },
    { id: 'routes', name: 'Маршруты', icon: MapPin },
    { id: 'drivers', name: 'Водители', icon: Users }
  ];

  const handleExportData = () => {
    // Подготовка данных для экспорта
    const exportData = {
      period,
      revenue: revenueData,
      status: statusData,
      routes: routesData,
      drivers: driversData,
      realtime: realTimeData,
      exportDate: new Date().toISOString()
    };

    // Создание и скачивание JSON файла
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    fetchAllData();
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
