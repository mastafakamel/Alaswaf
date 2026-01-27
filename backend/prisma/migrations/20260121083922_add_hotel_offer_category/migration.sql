/*
  Warnings:

  - You are about to drop the column `city` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `departureCity` on the `Offer` table. All the data in the column will be lost.
  - Added the required column `cityId` to the `Branch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureCityId` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('PENDING', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- AlterEnum
ALTER TYPE "OfferCategory" ADD VALUE 'HOTEL';

-- DropIndex
DROP INDEX "Branch_city_key";

-- DropIndex
DROP INDEX "Offer_isActive_category_departureCity_idx";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginIp" TEXT;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "city",
ADD COLUMN     "cityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT DEFAULT '',
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "departureCity",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "departureCityId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "DepartureCity";

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_deletedAt_idx" ON "BlogPost"("deletedAt");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Offer_isActive_category_departureCityId_idx" ON "Offer"("isActive", "category", "departureCityId");

-- CreateIndex
CREATE INDEX "Offer_deletedAt_idx" ON "Offer"("deletedAt");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_departureCityId_fkey" FOREIGN KEY ("departureCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
