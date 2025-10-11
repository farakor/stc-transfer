import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { BookingStatus } from '../../types';

interface StatusData {
  status: BookingStatus;
  count: number;
  percentage: number;
}

interface OrdersStatusChartProps {
  data: StatusData[];
  loading?: boolean;
  chartType?: 'pie' | 'bar';
}

const OrdersStatusChart: React.FC<OrdersStatusChartProps> = ({
  data,
  loading,
  chartType = 'pie'
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

  const statusColors: Record<BookingStatus, string> = {
    PENDING: '#F59E0B',
    CONFIRMED: '#3B82F6',
    IN_PROGRESS: '#8B5CF6',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444'
  };

  const statusLabels: Record<BookingStatus, string> = {
    PENDING: 'Ожидают',
    CONFIRMED: 'Подтверждены',
    IN_PROGRESS: 'В пути',
    COMPLETED: 'Завершены',
    CANCELLED: 'Отменены'
  };

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  const chartData = data.map(item => ({
    ...item,
    name: statusLabels[item.status],
    fill: statusColors[item.status]
  }));

  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Количество: <span className="font-medium">{data.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Процент: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Статусы заказов</h3>
          <p className="text-sm text-gray-600">Распределение по статусам</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
          <div className="text-sm text-gray-600">Всего заказов</div>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {data.map((item) => (
          <div
            key={item.status}
            className="text-center p-3 rounded-lg border-2"
            style={{
              borderColor: statusColors[item.status] + '40',
              backgroundColor: statusColors[item.status] + '10'
            }}
          >
            <div
              className="text-lg font-semibold"
              style={{ color: statusColors[item.status] }}
            >
              {item.count}
            </div>
            <div className="text-xs text-gray-600">
              {statusLabels[item.status]}
            </div>
            <div className="text-xs font-medium text-gray-500">
              {item.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* График */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload?.count})
                  </span>
                )}
              />
            </PieChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={renderCustomTooltip} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrdersStatusChart;
