import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Car,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';

interface RealTimeData {
  activeOrders: number;
  availableDrivers: number;
  busyDrivers: number;
  avgResponseTime: number;
  pendingOrders: number;
  completionRate: number;
  currentRevenue: number;
  ordersPerHour: number;
}

interface RealTimeMetricsProps {
  data: RealTimeData;
  loading?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  data,
  loading,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [isLive, setIsLive] = useState(autoRefresh);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        // Здесь можно добавить логику обновления данных
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [isLive, refreshInterval]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Активные заказы',
      value: data.activeOrders,
      icon: Activity,
      color: 'blue',
      trend: data.activeOrders > 0 ? 'up' : 'neutral',
      description: 'Заказы в процессе выполнения'
    },
    {
      title: 'Доступные водители',
      value: data.availableDrivers,
      icon: Users,
      color: 'green',
      trend: data.availableDrivers > data.busyDrivers ? 'up' : 'down',
      description: 'Готовы к новым заказам'
    },
    {
      title: 'Занятые водители',
      value: data.busyDrivers,
      icon: Car,
      color: 'orange',
      trend: 'neutral',
      description: 'Выполняют заказы'
    },
    {
      title: 'Время отклика',
      value: `${data.avgResponseTime} мин`,
      icon: Clock,
      color: data.avgResponseTime <= 5 ? 'green' : data.avgResponseTime <= 10 ? 'yellow' : 'red',
      trend: data.avgResponseTime <= 5 ? 'up' : 'down',
      description: 'Среднее время ответа'
    },
    {
      title: 'В ожидании',
      value: data.pendingOrders,
      icon: AlertTriangle,
      color: data.pendingOrders > 0 ? 'red' : 'green',
      trend: data.pendingOrders > 0 ? 'down' : 'up',
      description: 'Требуют назначения водителя'
    },
    {
      title: 'Завершаемость',
      value: `${data.completionRate}%`,
      icon: CheckCircle,
      color: data.completionRate >= 90 ? 'green' : data.completionRate >= 75 ? 'yellow' : 'red',
      trend: data.completionRate >= 90 ? 'up' : 'down',
      description: 'Процент завершенных заказов'
    },
    {
      title: 'Выручка сегодня',
      value: `${(data.currentRevenue / 1000).toFixed(0)}k сум`,
      icon: TrendingUp,
      color: 'purple',
      trend: 'up',
      description: 'Доход за текущий день'
    },
    {
      title: 'Заказов в час',
      value: data.ordersPerHour,
      icon: Zap,
      color: 'indigo',
      trend: data.ordersPerHour > 5 ? 'up' : 'neutral',
      description: 'Интенсивность заказов'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-100',
      green: 'bg-green-500 text-green-100',
      orange: 'bg-orange-500 text-orange-100',
      red: 'bg-red-500 text-red-100',
      yellow: 'bg-yellow-500 text-yellow-100',
      purple: 'bg-purple-500 text-purple-100',
      indigo: 'bg-indigo-500 text-indigo-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBorderColor = (color: string) => {
    const colors = {
      blue: 'border-blue-200',
      green: 'border-green-200',
      orange: 'border-orange-200',
      red: 'border-red-200',
      yellow: 'border-yellow-200',
      purple: 'border-purple-200',
      indigo: 'border-indigo-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Метрики в реальном времени
          </h3>
          <p className="text-sm text-gray-600">
            Текущее состояние системы
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isLive ? 'В реальном времени' : 'Обновление приостановлено'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 text-xs rounded-full border ${isLive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
          >
            {isLive ? 'Пауза' : 'Возобновить'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getBorderColor(metric.color)} bg-gradient-to-br from-white to-gray-50`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                <metric.icon className="w-4 h-4" />
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {metric.title}
              </div>
              <div className="text-xs text-gray-500">
                {metric.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Статус системы */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Система работает нормально</span>
          </div>
          {data.pendingOrders > 0 && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-700">
                {data.pendingOrders} заказов требуют внимания
              </span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetrics;
