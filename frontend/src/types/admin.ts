import { BookingStatus } from './index';

// Админ типы
export interface BookingStats {
  period?: 'day' | 'week' | 'month';
  statusStats: Array<{
    status: BookingStatus;
    _count: {
      status: number;
    };
  }>;
  totalRevenue: number;
  vehicleTypeStats: Array<{
    vehicle_id: number;
    _count: {
      vehicle_id: number;
    };
    _sum: {
      total_price: number;
    };
  }>;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'DISPATCHER';
  createdAt: string;
}

export interface TelegramNotification {
  chatId: string;
  message: string;
  type?: 'booking_update' | 'driver_assigned' | 'booking_cancelled';
}

export interface AdminApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AdminDashboardData {
  todayStats: {
    totalBookings: number;
    completedBookings: number;
    activeBookings: number;
    revenue: number;
  };
  weeklyStats: {
    bookingsGrowth: number;
    revenueGrowth: number;
  };
  urgentBookings: Array<{
    id: string;
    fromLocation: string;
    toLocation: string;
    createdAt: string;
    user: {
      name?: string;
      phone?: string;
    };
  }>;
  availableDrivers: number;
  busyDrivers: number;
}

export interface DriverAssignmentHistory {
  id: string;
  bookingId: string;
  driverId: string;
  assignedAt: string;
  assignedBy: string;
  driver: {
    name: string;
    phone: string;
  };
}

export interface BookingFilter {
  status?: BookingStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  driverId?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedBookings {
  bookings: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
