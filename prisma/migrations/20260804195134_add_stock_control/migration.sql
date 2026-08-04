-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "StockMovementReason" AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'LOSS', 'OTHER');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "minStockAlert" DECIMAL(12,2),
ADD COLUMN     "stockQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "trackStock" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "reason" "StockMovementReason" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unitCost" DECIMAL(12,2),
    "unitPrice" DECIMAL(12,2),
    "quoteItemId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockMovement_companyId_idx" ON "StockMovement"("companyId");

-- CreateIndex
CREATE INDEX "StockMovement_companyId_productId_idx" ON "StockMovement"("companyId", "productId");

-- CreateIndex
CREATE INDEX "StockMovement_quoteItemId_idx" ON "StockMovement"("quoteItemId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_quoteItemId_fkey" FOREIGN KEY ("quoteItemId") REFERENCES "QuoteItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
