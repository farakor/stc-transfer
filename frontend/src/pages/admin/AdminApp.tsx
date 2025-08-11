import React from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import BookingsManagement from './BookingsManagement';
import DriversManagement from './DriversManagement';

interface AdminAppProps {
  page?: 'dashboard' | 'bookings' | 'drivers' | 'vehicles' | 'settings';
}

const AdminApp: React.FC<AdminAppProps> = ({ page = 'dashboard' }) => {
  const renderCurrentPage = () => {
    switch (page) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'bookings':
        return <BookingsManagement />;
      case 'drivers':
        return <DriversManagement />;
      case 'vehicles':
        return <VehiclesManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout currentPage={page}>
      {renderCurrentPage()}
    </AdminLayout>
  );
};

// Заглушки для других страниц (будут реализованы позже)

const VehiclesManagement: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Управление транспортом</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <p className="text-gray-600">Страница управления транспортом в разработке</p>
    </div>
  </div>
);

const AdminSettings: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">Настройки системы</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <p className="text-gray-600">Страница настроек в разработке</p>
    </div>
  </div>
);

export default AdminApp;
