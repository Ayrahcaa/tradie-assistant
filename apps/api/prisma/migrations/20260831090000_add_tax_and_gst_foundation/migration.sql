CREATE TYPE "BusinessStructure" AS ENUM ('SOLE_TRADER', 'COMPANY', 'PARTNERSHIP', 'TRUST', 'OTHER');
CREATE TYPE "GstAccountingMethod" AS ENUM ('CASH', 'ACCRUAL');
CREATE TYPE "BasFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUALLY');
CREATE TYPE "TaxProfile" AS ENUM ('UNSPECIFIED', 'AUSTRALIAN_RESIDENT_INDIVIDUAL', 'UNSUPPORTED');
CREATE TYPE "GstTreatment" AS ENUM ('GST_INCLUDED', 'GST_FREE', 'MANUAL', 'NOT_CLAIMABLE', 'UNKNOWN');

ALTER TABLE "User"
ADD COLUMN "businessStructure" "BusinessStructure" NOT NULL DEFAULT 'SOLE_TRADER',
ADD COLUMN "gstAccountingMethod" "GstAccountingMethod" NOT NULL DEFAULT 'CASH',
ADD COLUMN "basFrequency" "BasFrequency" NOT NULL DEFAULT 'QUARTERLY',
ADD COLUMN "taxProfile" "TaxProfile" NOT NULL DEFAULT 'UNSPECIFIED',
ADD COLUMN "taxFinancialYear" TEXT NOT NULL DEFAULT '2026-27',
ADD COLUMN "otherTaxableIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "additionalDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE "InvoiceItem" ADD COLUMN "gstApplicable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Expense"
ADD COLUMN "gstTreatment" "GstTreatment" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "gstClaimable" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "PaygInstalment" (
  "id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL,
  "period" TEXT,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ownerId" TEXT NOT NULL,
  CONSTRAINT "PaygInstalment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PaygInstalment_ownerId_idx" ON "PaygInstalment"("ownerId");
CREATE INDEX "PaygInstalment_paidAt_idx" ON "PaygInstalment"("paidAt");
ALTER TABLE "PaygInstalment" ADD CONSTRAINT "PaygInstalment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
