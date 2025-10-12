import React from 'react';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import BookingsManagement from './BookingsManagement';
import DriversManagement from './DriversManagement';
import VehiclesManagement from './VehiclesManagement';
import SystemSettings from './SystemSettings';
import TariffsManagement from './TariffsManagement';
import UsersManagement from './UsersManagement';
import AdminsManagement from './AdminsManagement';

interface AdminAppProps {
  page?: 'dashboard' | 'bookings' | 'drivers' | 'vehicles' | 'users' | 'tariffs' | 'settings' | 'admins';
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
      case 'tariffs':
        return <TariffsManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'admins':
        return <AdminsManagement />;
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
