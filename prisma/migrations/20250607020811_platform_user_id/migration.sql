/*
  Warnings:

  - A unique constraint covering the columns `[platform,userId]` on the table `UserPlatform` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserPlatform_platform_userId_key" ON "UserPlatform"("platform", "userId");
