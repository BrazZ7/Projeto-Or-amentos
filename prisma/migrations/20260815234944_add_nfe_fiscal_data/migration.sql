-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('SIMPLES', 'SIMPLES_EXCESSO', 'NORMAL');

-- CreateEnum
CREATE TYPE "FiscalEnvironment" AS ENUM ('HOMOLOGACAO', 'PRODUCAO');

-- CreateEnum
CREATE TYPE "StateRegistrationType" AS ENUM ('CONTRIBUINTE', 'ISENTO', 'NAO_CONTRIBUINTE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PROCESSING', 'AUTHORIZED', 'REJECTED', 'CANCELED', 'ERROR');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "cityCode" TEXT,
ADD COLUMN     "stateRegistration" TEXT,
ADD COLUMN     "stateRegistrationType" "StateRegistrationType" NOT NULL DEFAULT 'NAO_CONTRIBUINTE';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "cityCode" TEXT,
ADD COLUMN     "nfeEnvironment" "FiscalEnvironment" NOT NULL DEFAULT 'HOMOLOGACAO',
ADD COLUMN     "nfeNextNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nfeProviderRef" TEXT,
ADD COLUMN     "nfeSeries" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stateRegistration" TEXT,
ADD COLUMN     "taxRegime" "TaxRegime" NOT NULL DEFAULT 'SIMPLES';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cest" TEXT,
ADD COLUMN     "cfop" TEXT,
ADD COLUMN     "ncm" TEXT,
ADD COLUMN     "taxOrigin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxSituation" TEXT,
ADD COLUMN     "taxableUnit" TEXT;

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "quoteId" TEXT,
    "clientId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "environment" "FiscalEnvironment" NOT NULL DEFAULT 'HOMOLOGACAO',
    "number" INTEGER NOT NULL,
    "series" INTEGER NOT NULL DEFAULT 1,
    "accessKey" TEXT,
    "protocol" TEXT,
    "xmlUrl" TEXT,
    "danfeUrl" TEXT,
    "providerRef" TEXT,
    "rejectionCode" TEXT,
    "rejectionMessage" TEXT,
    "operationNature" TEXT NOT NULL DEFAULT 'Venda de mercadoria',
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "issuedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_accessKey_key" ON "Invoice"("accessKey");

-- CreateIndex
CREATE INDEX "Invoice_companyId_idx" ON "Invoice"("companyId");

-- CreateIndex
CREATE INDEX "Invoice_companyId_status_idx" ON "Invoice"("companyId", "status");

-- CreateIndex
CREATE INDEX "Invoice_quoteId_idx" ON "Invoice"("quoteId");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_companyId_series_number_key" ON "Invoice"("companyId", "series", "number");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
