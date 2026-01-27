/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('GROUP', 'PRIVATE');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "address" TEXT DEFAULT '',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mapUrl" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "cancellationPolicy" TEXT DEFAULT '',
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "durationNights" INTEGER,
ADD COLUMN     "metaDescription" TEXT DEFAULT '',
ADD COLUMN     "metaTitle" TEXT DEFAULT '',
ADD COLUMN     "offerType" "OfferType" NOT NULL DEFAULT 'GROUP',
ADD COLUMN     "pickupInfo" TEXT DEFAULT '',
ADD COLUMN     "runText" TEXT DEFAULT '',
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "OfferImage" ADD COLUMN     "alt" TEXT DEFAULT '';

-- CreateTable
CREATE TABLE "BranchPhone" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "label" TEXT DEFAULT '',
    "phone" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BranchPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferItinerary" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "imageUrl" TEXT DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OfferItinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferHighlight" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OfferHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferInclude" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OfferInclude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferExclude" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OfferExclude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferWhatToBring" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OfferWhatToBring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferPriceTier" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OfferPriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT DEFAULT '',
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT DEFAULT '',
    "authorName" TEXT DEFAULT '',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "metaTitle" TEXT DEFAULT '',
    "metaDescription" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateIndex
CREATE INDEX "BranchPhone_branchId_idx" ON "BranchPhone"("branchId");

-- CreateIndex
CREATE INDEX "OfferItinerary_offerId_idx" ON "OfferItinerary"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferItinerary_offerId_dayNumber_key" ON "OfferItinerary"("offerId", "dayNumber");

-- CreateIndex
CREATE INDEX "OfferHighlight_offerId_idx" ON "OfferHighlight"("offerId");

-- CreateIndex
CREATE INDEX "OfferInclude_offerId_idx" ON "OfferInclude"("offerId");

-- CreateIndex
CREATE INDEX "OfferExclude_offerId_idx" ON "OfferExclude"("offerId");

-- CreateIndex
CREATE INDEX "OfferWhatToBring_offerId_idx" ON "OfferWhatToBring"("offerId");

-- CreateIndex
CREATE INDEX "OfferPriceTier_offerId_idx" ON "OfferPriceTier"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "BlogTag"("name");

-- CreateIndex
CREATE INDEX "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_slug_key" ON "Offer"("slug");

-- AddForeignKey
ALTER TABLE "BranchPhone" ADD CONSTRAINT "BranchPhone_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferItinerary" ADD CONSTRAINT "OfferItinerary_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferHighlight" ADD CONSTRAINT "OfferHighlight_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferInclude" ADD CONSTRAINT "OfferInclude_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferExclude" ADD CONSTRAINT "OfferExclude_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferWhatToBring" ADD CONSTRAINT "OfferWhatToBring_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferPriceTier" ADD CONSTRAINT "OfferPriceTier_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
