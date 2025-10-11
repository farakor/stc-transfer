-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "wialon_unit_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_wialon_unit_id_key" ON "Vehicle"("wialon_unit_id");

