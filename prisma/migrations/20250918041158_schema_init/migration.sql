/*
  Warnings:

  - You are about to drop the column `nickname` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `password` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('small', 'family', 'office');

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('서울', '경기', '인천', '강원', '충북', '충남', '세종', '대전', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주');

-- CreateEnum
CREATE TYPE "public"."DirectRequestStatus" AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "public"."QuoteType" AS ENUM ('normal', 'direct');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_QUOTE_RECEIVED', 'MOVE_REQUEST_DECIDED', 'D_DAY_ALARM', 'DIRECT_QUOTE_REQ_DENIED', 'ETC');

-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "nickname",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "img" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "region" "public"."Region" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."Mover" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "img" TEXT NOT NULL DEFAULT '',
    "nickname" TEXT NOT NULL,
    "career" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerServiceType" (
    "id" SERIAL NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "CustomerServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MoverServiceType" (
    "id" SERIAL NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "moverId" INTEGER NOT NULL,

    CONSTRAINT "MoverServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MoverRegion" (
    "id" SERIAL NOT NULL,
    "region" "public"."Region" NOT NULL,
    "moverId" INTEGER NOT NULL,

    CONSTRAINT "MoverRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Likes" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "moverId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MoveRequest" (
    "id" SERIAL NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "moveDate" TIMESTAMP(3) NOT NULL,
    "departure" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "customerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DirectQuoteRequest" (
    "id" SERIAL NOT NULL,
    "moveRequestId" INTEGER NOT NULL,
    "moverId" INTEGER NOT NULL,
    "status" "public"."DirectRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectQuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RejectedRequest" (
    "id" SERIAL NOT NULL,
    "comment" TEXT NOT NULL,
    "directRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejectedRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quote" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "moveRequestId" INTEGER NOT NULL,
    "moverId" INTEGER NOT NULL,
    "status" "public"."QuoteStatus" NOT NULL DEFAULT 'pending',
    "type" "public"."QuoteType" NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "moverId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mover_email_key" ON "public"."Mover"("email");

-- CreateIndex
CREATE INDEX "Mover_email_idx" ON "public"."Mover"("email");

-- CreateIndex
CREATE INDEX "Mover_nickname_idx" ON "public"."Mover"("nickname");

-- CreateIndex
CREATE INDEX "Mover_createdAt_idx" ON "public"."Mover"("createdAt");

-- CreateIndex
CREATE INDEX "Mover_career_idx" ON "public"."Mover"("career");

-- CreateIndex
CREATE INDEX "CustomerServiceType_customerId_serviceType_idx" ON "public"."CustomerServiceType"("customerId", "serviceType");

-- CreateIndex
CREATE INDEX "CustomerServiceType_serviceType_idx" ON "public"."CustomerServiceType"("serviceType");

-- CreateIndex
CREATE INDEX "MoverServiceType_moverId_serviceType_idx" ON "public"."MoverServiceType"("moverId", "serviceType");

-- CreateIndex
CREATE INDEX "MoverServiceType_serviceType_idx" ON "public"."MoverServiceType"("serviceType");

-- CreateIndex
CREATE INDEX "MoverRegion_moverId_region_idx" ON "public"."MoverRegion"("moverId", "region");

-- CreateIndex
CREATE INDEX "MoverRegion_region_idx" ON "public"."MoverRegion"("region");

-- CreateIndex
CREATE INDEX "Likes_customerId_idx" ON "public"."Likes"("customerId");

-- CreateIndex
CREATE INDEX "Likes_moverId_idx" ON "public"."Likes"("moverId");

-- CreateIndex
CREATE INDEX "Likes_customerId_moverId_idx" ON "public"."Likes"("customerId", "moverId");

-- CreateIndex
CREATE INDEX "Likes_createdAt_idx" ON "public"."Likes"("createdAt");

-- CreateIndex
CREATE INDEX "MoveRequest_customerId_idx" ON "public"."MoveRequest"("customerId");

-- CreateIndex
CREATE INDEX "MoveRequest_serviceType_idx" ON "public"."MoveRequest"("serviceType");

-- CreateIndex
CREATE INDEX "MoveRequest_moveDate_idx" ON "public"."MoveRequest"("moveDate");

-- CreateIndex
CREATE INDEX "MoveRequest_isFinished_idx" ON "public"."MoveRequest"("isFinished");

-- CreateIndex
CREATE INDEX "MoveRequest_customerId_serviceType_idx" ON "public"."MoveRequest"("customerId", "serviceType");

-- CreateIndex
CREATE INDEX "MoveRequest_serviceType_moveDate_idx" ON "public"."MoveRequest"("serviceType", "moveDate");

-- CreateIndex
CREATE INDEX "MoveRequest_createdAt_idx" ON "public"."MoveRequest"("createdAt");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_moveRequestId_idx" ON "public"."DirectQuoteRequest"("moveRequestId");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_moverId_idx" ON "public"."DirectQuoteRequest"("moverId");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_status_idx" ON "public"."DirectQuoteRequest"("status");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_moveRequestId_moverId_idx" ON "public"."DirectQuoteRequest"("moveRequestId", "moverId");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_status_createdAt_idx" ON "public"."DirectQuoteRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_createdAt_idx" ON "public"."DirectQuoteRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RejectedRequest_directRequestId_key" ON "public"."RejectedRequest"("directRequestId");

-- CreateIndex
CREATE INDEX "Quote_moveRequestId_idx" ON "public"."Quote"("moveRequestId");

-- CreateIndex
CREATE INDEX "Quote_moverId_idx" ON "public"."Quote"("moverId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "public"."Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_type_idx" ON "public"."Quote"("type");

-- CreateIndex
CREATE INDEX "Quote_price_idx" ON "public"."Quote"("price");

-- CreateIndex
CREATE INDEX "Quote_moveRequestId_status_idx" ON "public"."Quote"("moveRequestId", "status");

-- CreateIndex
CREATE INDEX "Quote_status_createdAt_idx" ON "public"."Quote"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "public"."Quote"("createdAt");

-- CreateIndex
CREATE INDEX "Review_customerId_idx" ON "public"."Review"("customerId");

-- CreateIndex
CREATE INDEX "Review_moverId_idx" ON "public"."Review"("moverId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "public"."Review"("rating");

-- CreateIndex
CREATE INDEX "Review_moverId_rating_idx" ON "public"."Review"("moverId", "rating");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "public"."Review"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "public"."Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "public"."Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_type_idx" ON "public"."Notification"("userId", "type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Customer_region_idx" ON "public"."Customer"("region");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "public"."Customer"("createdAt");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "public"."Customer"("email");

-- AddForeignKey
ALTER TABLE "public"."CustomerServiceType" ADD CONSTRAINT "CustomerServiceType_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MoverServiceType" ADD CONSTRAINT "MoverServiceType_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MoverRegion" ADD CONSTRAINT "MoverRegion_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MoveRequest" ADD CONSTRAINT "MoveRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DirectQuoteRequest" ADD CONSTRAINT "DirectQuoteRequest_moveRequestId_fkey" FOREIGN KEY ("moveRequestId") REFERENCES "public"."MoveRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DirectQuoteRequest" ADD CONSTRAINT "DirectQuoteRequest_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RejectedRequest" ADD CONSTRAINT "RejectedRequest_directRequestId_fkey" FOREIGN KEY ("directRequestId") REFERENCES "public"."DirectQuoteRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_moveRequestId_fkey" FOREIGN KEY ("moveRequestId") REFERENCES "public"."MoveRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quote" ADD CONSTRAINT "Quote_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
