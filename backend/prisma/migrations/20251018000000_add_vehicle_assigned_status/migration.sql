-- AlterEnum
-- Добавляем значение VEHICLE_ASSIGNED в enum BookingStatus
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'VEHICLE_ASSIGNED';

