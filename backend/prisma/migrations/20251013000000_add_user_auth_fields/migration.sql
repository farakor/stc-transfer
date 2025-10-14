-- AlterTable
ALTER TABLE "User" ADD COLUMN "auth_token" TEXT,
ADD COLUMN "is_phone_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_auth_token_key" ON "User"("auth_token");

