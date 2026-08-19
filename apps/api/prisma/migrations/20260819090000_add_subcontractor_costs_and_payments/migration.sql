-- CreateEnum
CREATE TYPE "SubcontractorRateType" AS ENUM ('HOURLY', 'SQUARE_METRE', 'DAILY', 'FIXED_TASK', 'FIXED_PROJECT', 'PER_UNIT', 'OTHER');

-- CreateEnum
CREATE TYPE "SubcontractorCostStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "SubcontractorProjectCost" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "rateType" "SubcontractorRateType" NOT NULL,
    "rate" DECIMAL(12,2),
    "quantity" DECIMAL(12,2),
    "calculatedAmount" DECIMAL(12,2),
    "agreedAmount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountPending" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "SubcontractorCostStatus" NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subcontractorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "SubcontractorProjectCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubcontractorPayment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "costId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "SubcontractorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubcontractorProjectCost_subcontractorId_idx" ON "SubcontractorProjectCost"("subcontractorId");
CREATE INDEX "SubcontractorProjectCost_projectId_idx" ON "SubcontractorProjectCost"("projectId");
CREATE INDEX "SubcontractorProjectCost_ownerId_idx" ON "SubcontractorProjectCost"("ownerId");
CREATE INDEX "SubcontractorProjectCost_status_idx" ON "SubcontractorProjectCost"("status");
CREATE INDEX "SubcontractorPayment_costId_idx" ON "SubcontractorPayment"("costId");
CREATE INDEX "SubcontractorPayment_ownerId_idx" ON "SubcontractorPayment"("ownerId");
CREATE INDEX "SubcontractorPayment_paidAt_idx" ON "SubcontractorPayment"("paidAt");

-- AddForeignKey
ALTER TABLE "SubcontractorProjectCost" ADD CONSTRAINT "SubcontractorProjectCost_subcontractorId_fkey" FOREIGN KEY ("subcontractorId") REFERENCES "Subcontractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubcontractorProjectCost" ADD CONSTRAINT "SubcontractorProjectCost_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubcontractorProjectCost" ADD CONSTRAINT "SubcontractorProjectCost_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubcontractorPayment" ADD CONSTRAINT "SubcontractorPayment_costId_fkey" FOREIGN KEY ("costId") REFERENCES "SubcontractorProjectCost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubcontractorPayment" ADD CONSTRAINT "SubcontractorPayment_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
