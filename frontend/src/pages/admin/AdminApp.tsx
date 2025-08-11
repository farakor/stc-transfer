import React from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import BookingsManagement from './BookingsManagement';
import DriversManagement from './DriversManagement';
import VehiclesManagement from './VehiclesManagement';
import SystemSettings from './SystemSettings';
import UsersManagement from './UsersManagement';

interface AdminAppProps {
  page?: 'dashboard' | 'bookings' | 'drivers' | 'vehicles' | 'users' | 'settings';
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
      case 'users':
        return <UsersManagement />;
      case 'settings':
        return <SystemSettings />;
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

export default AdminApp;
