/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "TokenUsage" DROP CONSTRAINT "TokenUsage_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 100;

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "TokenUsage";

-- DropEnum
DROP TYPE "SubscriptionPlan";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- CreateTable
CREATE TABLE "CreditPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "credits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "flutterwaveTransactionId" TEXT,
    "flutterwaveTxRef" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditPurchase_flutterwaveTransactionId_key" ON "CreditPurchase"("flutterwaveTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditPurchase_flutterwaveTxRef_key" ON "CreditPurchase"("flutterwaveTxRef");

-- CreateIndex
CREATE INDEX "CreditUsage_userId_createdAt_idx" ON "CreditUsage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditUsage" ADD CONSTRAINT "CreditUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
