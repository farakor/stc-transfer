-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'city',
    "coordinates" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TariffRoute" (
    "id" SERIAL NOT NULL,
    "from_location_id" INTEGER NOT NULL,
    "to_location_id" INTEGER NOT NULL,
    "distance_km" DECIMAL(10,2),
    "estimated_duration_minutes" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TariffRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tariff" (
    "id" SERIAL NOT NULL,
    "route_id" INTEGER NOT NULL,
    "vehicle_brand" TEXT NOT NULL,
    "vehicle_model" TEXT NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "price_per_km" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minimum_price" DECIMAL(12,2),
    "night_surcharge_percent" DECIMAL(5,2) DEFAULT 0,
    "holiday_surcharge_percent" DECIMAL(5,2) DEFAULT 0,
    "waiting_price_per_minute" DECIMAL(8,2) DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tariff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TariffRoute_from_location_id_to_location_id_key" ON "TariffRoute"("from_location_id", "to_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tariff_route_id_vehicle_brand_vehicle_model_key" ON "Tariff"("route_id", "vehicle_brand", "vehicle_model");

-- AddForeignKey
ALTER TABLE "TariffRoute" ADD CONSTRAINT "TariffRoute_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TariffRoute" ADD CONSTRAINT "TariffRoute_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tariff" ADD CONSTRAINT "Tariff_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "TariffRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
