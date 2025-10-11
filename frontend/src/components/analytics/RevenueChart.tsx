import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  period: 'day' | 'week' | 'month';
  loading?: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, period, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Расчет тренда (сравнение первой и последней точки)
  const trend = data.length > 1
    ? ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue) * 100
    : 0;

  const formatCurrency = (value: number) => {
    return `${(value / 1000).toFixed(0)}k сум`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'day':
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
      case 'week':
        return `Неделя ${Math.ceil(date.getDate() / 7)}`;
      case 'month':
        return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
      default:
        return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Динамика выручки</h3>
          <p className="text-sm text-gray-600">
            {period === 'day' ? 'За последние дни' :
              period === 'week' ? 'За последние недели' : 'За последние месяцы'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalRevenue)}
            </div>
            <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-semibold text-blue-900">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-blue-600">Общая выручка</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-900">{totalOrders}</div>
          <div className="text-sm text-green-600">Всего заказов</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-semibold text-purple-900">
            {formatCurrency(avgOrderValue)}
          </div>
          <div className="text-sm text-purple-600">Средний чек</div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#6B7280"
              fontSize={12}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Выручка']}
              labelFormatter={(label) => `Дата: ${formatDate(label)}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
