-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WHATSAPP', 'CONTACT');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "offerId" TEXT,
    "name" TEXT DEFAULT '',
    "phone" TEXT DEFAULT '',
    "message" TEXT DEFAULT '',
    "source" "LeadSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_offerId_idx" ON "Lead"("offerId");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE INDEX "Offer_isActive_category_departureCity_idx" ON "Offer"("isActive", "category", "departureCity");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
