import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { User, Star, Clock, TrendingUp } from 'lucide-react';

interface DriverPerformanceData {
  driverId: string;
  name: string;
  completedOrders: number;
  totalRevenue: number;
  avgRating: number;
  avgResponseTime: number; // в минутах
  efficiency: number; // процент завершенных заказов
}

interface DriverPerformanceChartProps {
  data: DriverPerformanceData[];
  loading?: boolean;
  metric?: 'orders' | 'revenue' | 'rating' | 'efficiency';
}

const DriverPerformanceChart: React.FC<DriverPerformanceChartProps> = ({
  data,
  loading,
  metric = 'orders'
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    switch (metric) {
      case 'orders':
        return b.completedOrders - a.completedOrders;
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'rating':
        return b.avgRating - a.avgRating;
      case 'efficiency':
        return b.efficiency - a.efficiency;
      default:
        return b.completedOrders - a.completedOrders;
    }
  }).slice(0, 10);

  const getMetricValue = (driver: DriverPerformanceData) => {
    switch (metric) {
      case 'orders':
        return driver.completedOrders;
      case 'revenue':
        return driver.totalRevenue;
      case 'rating':
        return driver.avgRating;
      case 'efficiency':
        return driver.efficiency;
      default:
        return driver.completedOrders;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'orders':
        return 'Завершенные заказы';
      case 'revenue':
        return 'Выручка';
      case 'rating':
        return 'Рейтинг';
      case 'efficiency':
        return 'Эффективность (%)';
      default:
        return 'Заказы';
    }
  };

  const formatValue = (value: number) => {
    switch (metric) {
      case 'revenue':
        return `${(value / 1000).toFixed(0)}k сум`;
      case 'rating':
        return value.toFixed(1);
      case 'efficiency':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const getBarColor = (index: number, value: number) => {
    if (metric === 'rating') {
      if (value >= 4.5) return '#10B981'; // Зеленый для высокого рейтинга
      if (value >= 4.0) return '#F59E0B'; // Желтый для среднего
      return '#EF4444'; // Красный для низкого
    }

    if (metric === 'efficiency') {
      if (value >= 90) return '#10B981';
      if (value >= 75) return '#F59E0B';
      return '#EF4444';
    }

    // Градиент для заказов и выручки
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
    return colors[index % colors.length];
  };

  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const driver = props.payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center mb-3">
            <User className="w-4 h-4 text-blue-500 mr-2" />
            <p className="font-medium">{driver.name}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Заказов:</span>
              <span className="font-medium">{driver.completedOrders}</span>
            </div>
            <div className="flex justify-between">
              <span>Выручка:</span>
              <span className="font-medium">{formatValue(driver.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Рейтинг:</span>
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="font-medium">{driver.avgRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Эффективность:</span>
              <span className="font-medium">{driver.efficiency.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Время отклика:</span>
              <div className="flex items-center">
                <Clock className="w-3 h-3 text-gray-400 mr-1" />
                <span className="font-medium">{driver.avgResponseTime} мин</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Топ-3 водителя
  const topDrivers = sortedData.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Производительность водителей
          </h3>
          <p className="text-sm text-gray-600">
            Рейтинг по {getMetricLabel().toLowerCase()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">Топ-10 водителей</span>
        </div>
      </div>

      {/* Топ-3 водителя */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Лидеры:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topDrivers.map((driver, index) => (
            <div
              key={driver.driverId}
              className={`p-4 rounded-lg border-2 ${index === 0 ? 'border-yellow-300 bg-yellow-50' :
                  index === 1 ? 'border-gray-300 bg-gray-50' :
                    'border-orange-300 bg-orange-50'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-500' :
                        'bg-orange-500'
                    }`}>
                    {index + 1}
                  </div>
                  <span className="ml-2 font-medium text-gray-900">{driver.name}</span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Заказов:</span>
                  <span className="font-medium">{driver.completedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Рейтинг:</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="font-medium">{driver.avgRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Эффективность:</span>
                  <span className="font-medium">{driver.efficiency.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* График */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={metric === 'revenue' ? (value) => `${(value / 1000).toFixed(0)}k` : undefined}
            />
            <Tooltip content={renderCustomTooltip} />
            <Bar
              dataKey={metric === 'orders' ? 'completedOrders' :
                metric === 'revenue' ? 'totalRevenue' :
                  metric === 'rating' ? 'avgRating' : 'efficiency'}
              radius={[4, 4, 0, 0]}
            >
              {sortedData.map((driver, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(index, getMetricValue(driver))}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DriverPerformanceChart;
