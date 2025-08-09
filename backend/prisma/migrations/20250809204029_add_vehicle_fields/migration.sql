/*
  Warnings:

  - The primary key for the `Booking` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Booking_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Booking_id_seq";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "license_plate" TEXT,
ADD COLUMN     "model" TEXT;
