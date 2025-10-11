import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { MapPin, TrendingUp } from 'lucide-react';

interface RouteData {
  route: string;
  from: string;
  to: string;
  count: number;
  revenue: number;
  avgPrice: number;
}

interface PopularRoutesChartProps {
  data: RouteData[];
  loading?: boolean;
  showRevenue?: boolean;
}

const PopularRoutesChart: React.FC<PopularRoutesChartProps> = ({
  data,
  loading,
  showRevenue = false
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

  const sortedData = [...data]
    .sort((a, b) => (showRevenue ? b.revenue - a.revenue : b.count - a.count))
    .slice(0, 10); // Показываем топ-10 маршрутов

  const maxValue = Math.max(...sortedData.map(item =>
    showRevenue ? item.revenue : item.count
  ));

  const formatCurrency = (value: number) => {
    return `${(value / 1000).toFixed(0)}k сум`;
  };

  const getBarColor = (index: number) => {
    const colors = [
      '#3B82F6', // Синий
      '#10B981', // Зеленый
      '#F59E0B', // Желтый
      '#8B5CF6', // Фиолетовый
      '#EF4444', // Красный
      '#06B6D4', // Голубой
      '#84CC16', // Лайм
      '#F97316', // Оранжевый
      '#EC4899', // Розовый
      '#6B7280'  // Серый
    ];
    return colors[index % colors.length];
  };

  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center mb-2">
            <MapPin className="w-4 h-4 text-blue-500 mr-2" />
            <p className="font-medium">{data.from} → {data.to}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p>Заказов: <span className="font-medium">{data.count}</span></p>
            <p>Выручка: <span className="font-medium">{formatCurrency(data.revenue)}</span></p>
            <p>Средняя цена: <span className="font-medium">{formatCurrency(data.avgPrice)}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalOrders = sortedData.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = sortedData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Популярные маршруты
          </h3>
          <p className="text-sm text-gray-600">
            Топ-10 маршрутов по {showRevenue ? 'выручке' : 'количеству заказов'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {showRevenue ? formatCurrency(totalRevenue) : totalOrders}
            </div>
            <div className="text-sm text-gray-600">
              {showRevenue ? 'Общая выручка' : 'Всего заказов'}
            </div>
          </div>
        </div>
      </div>

      {/* Список топ-3 маршрутов */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Топ-3 маршрута:</h4>
        <div className="space-y-2">
          {sortedData.slice(0, 3).map((route, index) => (
            <div key={route.route} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3"
                  style={{ backgroundColor: getBarColor(index) }}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {route.from} → {route.to}
                  </div>
                  <div className="text-sm text-gray-600">
                    {route.count} заказов • {formatCurrency(route.avgPrice)} средняя цена
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {showRevenue ? formatCurrency(route.revenue) : route.count}
                </div>
                <div className="text-sm text-gray-600">
                  {((showRevenue ? route.revenue : route.count) /
                    (showRevenue ? totalRevenue : totalOrders) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* График */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              tickFormatter={showRevenue ? formatCurrency : undefined}
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="route"
              stroke="#6B7280"
              fontSize={10}
              width={90}
              tickFormatter={(value) => {
                const route = sortedData.find(r => r.route === value);
                return route ? `${route.from} → ${route.to}` : value;
              }}
            />
            <Tooltip content={renderCustomTooltip} />
            <Bar
              dataKey={showRevenue ? "revenue" : "count"}
              radius={[0, 4, 4, 0]}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PopularRoutesChart;
