/*
  Warnings:

  - You are about to alter the column `email` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `img` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `password` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `phone` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to drop the column `isFinished` on the `MoveRequest` table. All the data in the column will be lost.
  - You are about to alter the column `departure` on the `MoveRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `destination` on the `MoveRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `email` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `phone` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `img` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `nickname` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `career` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `introduction` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - You are about to alter the column `description` on the `Mover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2000)`.
  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to alter the column `content` on the `Notification` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `link` on the `Notification` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `comment` on the `Quote` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - You are about to alter the column `comment` on the `RejectedRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - You are about to alter the column `content` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2000)`.
  - You are about to alter the column `rating` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.
  - A unique constraint covering the columns `[customerId,serviceType]` on the table `CustomerServiceType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moveRequestId,moverId]` on the table `DirectQuoteRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId,moverId]` on the table `Likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moverId,region]` on the table `MoverRegion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moverId,serviceType]` on the table `MoverServiceType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moveRequestId,moverId,type]` on the table `Quote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId,moveRequestId,moverId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moveRequestId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('CUSTOMER', 'MOVER');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MoveRequestStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FINISHED');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'QUOTE_ACCEPTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'QUOTE_REJECTED';
ALTER TYPE "public"."NotificationType" ADD VALUE 'REVIEW_RECEIVED';

-- AlterEnum
ALTER TYPE "public"."QuoteStatus" ADD VALUE 'expired';

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "public"."Customer_createdAt_idx";

-- DropIndex
DROP INDEX "public"."CustomerServiceType_customerId_serviceType_idx";

-- DropIndex
DROP INDEX "public"."DirectQuoteRequest_moveRequestId_moverId_idx";

-- DropIndex
DROP INDEX "public"."Likes_customerId_moverId_idx";

-- DropIndex
DROP INDEX "public"."MoveRequest_isFinished_idx";

-- DropIndex
DROP INDEX "public"."Mover_career_idx";

-- DropIndex
DROP INDEX "public"."Mover_createdAt_idx";

-- DropIndex
DROP INDEX "public"."MoverRegion_moverId_region_idx";

-- DropIndex
DROP INDEX "public"."MoverServiceType_moverId_serviceType_idx";

-- DropIndex
DROP INDEX "public"."Notification_read_idx";

-- DropIndex
DROP INDEX "public"."Notification_userId_read_idx";

-- DropIndex
DROP INDEX "public"."Quote_price_idx";

-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "img" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "public"."MoveRequest" DROP COLUMN "isFinished",
ADD COLUMN     "status" "public"."MoveRequestStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "departure" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "destination" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "public"."Mover" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "img" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "nickname" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "career" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "introduction" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(2000);

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "read",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moverId" INTEGER,
ADD COLUMN     "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "readAt" TIMESTAMP(3),
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "content" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "link" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "public"."Quote" ALTER COLUMN "comment" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "public"."RejectedRequest" ALTER COLUMN "comment" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "moveRequestId" INTEGER NOT NULL,
ALTER COLUMN "content" SET DATA TYPE VARCHAR(2000),
ALTER COLUMN "rating" SET DATA TYPE SMALLINT;

-- CreateIndex
CREATE INDEX "Customer_deleted_idx" ON "public"."Customer"("deleted");

-- CreateIndex
CREATE INDEX "Customer_isActive_idx" ON "public"."Customer"("isActive");

-- CreateIndex
CREATE INDEX "Customer_lastLoginAt_idx" ON "public"."Customer"("lastLoginAt");

-- CreateIndex
CREATE INDEX "CustomerServiceType_customerId_idx" ON "public"."CustomerServiceType"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerServiceType_customerId_serviceType_key" ON "public"."CustomerServiceType"("customerId", "serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "DirectQuoteRequest_moveRequestId_moverId_key" ON "public"."DirectQuoteRequest"("moveRequestId", "moverId");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_customerId_moverId_key" ON "public"."Likes"("customerId", "moverId");

-- CreateIndex
CREATE INDEX "MoveRequest_status_idx" ON "public"."MoveRequest"("status");

-- CreateIndex
CREATE INDEX "MoveRequest_status_createdAt_idx" ON "public"."MoveRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Mover_averageRating_idx" ON "public"."Mover"("averageRating");

-- CreateIndex
CREATE INDEX "Mover_isActive_idx" ON "public"."Mover"("isActive");

-- CreateIndex
CREATE INDEX "Mover_deleted_idx" ON "public"."Mover"("deleted");

-- CreateIndex
CREATE INDEX "Mover_lastLoginAt_idx" ON "public"."Mover"("lastLoginAt");

-- CreateIndex
CREATE INDEX "MoverRegion_moverId_idx" ON "public"."MoverRegion"("moverId");

-- CreateIndex
CREATE UNIQUE INDEX "MoverRegion_moverId_region_key" ON "public"."MoverRegion"("moverId", "region");

-- CreateIndex
CREATE INDEX "MoverServiceType_moverId_idx" ON "public"."MoverServiceType"("moverId");

-- CreateIndex
CREATE UNIQUE INDEX "MoverServiceType_moverId_serviceType_key" ON "public"."MoverServiceType"("moverId", "serviceType");

-- CreateIndex
CREATE INDEX "Notification_moverId_idx" ON "public"."Notification"("moverId");

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "public"."Notification"("priority");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_moverId_type_idx" ON "public"."Notification"("moverId", "type");

-- CreateIndex
CREATE INDEX "Notification_expiresAt_idx" ON "public"."Notification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_moveRequestId_moverId_type_key" ON "public"."Quote"("moveRequestId", "moverId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Review_customerId_moveRequestId_moverId_key" ON "public"."Review"("customerId", "moveRequestId", "moverId");

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_moveRequestId_fkey" FOREIGN KEY ("moveRequestId") REFERENCES "public"."MoveRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE SET NULL ON UPDATE CASCADE;
