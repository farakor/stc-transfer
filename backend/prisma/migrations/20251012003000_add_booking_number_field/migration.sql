-- AlterTable
-- Добавляем поле sequence_number с автоинкрементом
ALTER TABLE "Booking" ADD COLUMN "sequence_number" SERIAL;

-- Создаем уникальный индекс для sequence_number
CREATE UNIQUE INDEX "Booking_sequence_number_key" ON "Booking"("sequence_number");

-- Добавляем поле booking_number
ALTER TABLE "Booking" ADD COLUMN "booking_number" TEXT;

-- Заполняем booking_number для существующих записей
UPDATE "Booking" 
SET "booking_number" = 'СТТ-' || LPAD(sequence_number::text, 5, '0')
WHERE "booking_number" IS NULL;

-- Делаем booking_number обязательным и уникальным
ALTER TABLE "Booking" ALTER COLUMN "booking_number" SET NOT NULL;
CREATE UNIQUE INDEX "Booking_booking_number_key" ON "Booking"("booking_number");

