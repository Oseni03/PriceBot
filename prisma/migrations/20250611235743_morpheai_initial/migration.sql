-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('TELEGRAM', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'FEATURE');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'BUSINESS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "username" TEXT,
    "languageCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flutterwaveCustomerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "target_price" INTEGER,
    "url" TEXT NOT NULL,
    "tracking_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlatform" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'TELEGRAM',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "dailyTokenLimit" INTEGER NOT NULL DEFAULT 20,
    "productLimit" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "flutterwaveRef" TEXT,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL,
    "flutterwaveTransactionId" TEXT,
    "flutterwaveTxRef" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_flutterwaveCustomerId_key" ON "User"("flutterwaveCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatform_platform_platformId_key" ON "UserPlatform"("platform", "platformId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatform_platform_userId_key" ON "UserPlatform"("platform", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_flutterwaveRef_key" ON "Subscription"("flutterwaveRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_flutterwaveTransactionId_key" ON "Payment"("flutterwaveTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_flutterwaveTxRef_key" ON "Payment"("flutterwaveTxRef");

-- CreateIndex
CREATE INDEX "TokenUsage_userId_date_idx" ON "TokenUsage"("userId", "date");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlatform" ADD CONSTRAINT "UserPlatform_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenUsage" ADD CONSTRAINT "TokenUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
