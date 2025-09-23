-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('SMALL', 'FAMILY', 'OFFICE');

-- CreateEnum
CREATE TYPE "public"."Region" AS ENUM ('서울', '경기', '인천', '강원', '충북', '충남', '세종', '대전', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주');

-- CreateEnum
CREATE TYPE "public"."DirectRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."QuoteType" AS ENUM ('NORMAL', 'DIRECT');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('NEW_QUOTE_RECEIVED', 'MOVE_REQUEST_DECIDED', 'D_DAY_ALARM', 'DIRECT_QUOTE_REQ_DENIED', 'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'REVIEW_RECEIVED', 'ETC');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('CUSTOMER', 'MOVER');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MoveRequestStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FINISHED');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "img" VARCHAR(500) NOT NULL DEFAULT '',
    "region" "public"."Region" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mover" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "img" VARCHAR(500) NOT NULL DEFAULT '',
    "nickname" VARCHAR(50) NOT NULL,
    "career" VARCHAR(100) NOT NULL,
    "introduction" VARCHAR(1000) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userType" "public"."UserType" NOT NULL,
    "hashed" TEXT,
    "opaqueId" TEXT,
    "userAgent" VARCHAR(500),
    "ip" VARCHAR(45),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
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
    "departure" VARCHAR(200) NOT NULL,
    "departureRegion" TEXT NOT NULL,
    "destination" VARCHAR(200) NOT NULL,
    "destinationRegion" TEXT NOT NULL,
    "status" "public"."MoveRequestStatus" NOT NULL DEFAULT 'ACTIVE',
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
    "status" "public"."DirectRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectQuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RejectedRequest" (
    "id" SERIAL NOT NULL,
    "comment" VARCHAR(1000) NOT NULL,
    "directRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RejectedRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quote" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "comment" VARCHAR(1000) NOT NULL,
    "moveRequestId" INTEGER NOT NULL,
    "moverId" INTEGER NOT NULL,
    "status" "public"."QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "type" "public"."QuoteType" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(2000) NOT NULL,
    "rating" SMALLINT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "moverId" INTEGER NOT NULL,
    "moveRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "moverId" INTEGER,
    "content" VARCHAR(500) NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "link" VARCHAR(500),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_region_idx" ON "public"."Customer"("region");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "public"."Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_deleted_idx" ON "public"."Customer"("deleted");

-- CreateIndex
CREATE INDEX "Customer_isActive_idx" ON "public"."Customer"("isActive");

-- CreateIndex
CREATE INDEX "Customer_lastLoginAt_idx" ON "public"."Customer"("lastLoginAt");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_email_key" ON "public"."Mover"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_nickname_key" ON "public"."Mover"("nickname");

-- CreateIndex
CREATE INDEX "Mover_email_idx" ON "public"."Mover"("email");

-- CreateIndex
CREATE INDEX "Mover_nickname_idx" ON "public"."Mover"("nickname");

-- CreateIndex
CREATE INDEX "Mover_averageRating_idx" ON "public"."Mover"("averageRating");

-- CreateIndex
CREATE INDEX "Mover_isActive_idx" ON "public"."Mover"("isActive");

-- CreateIndex
CREATE INDEX "Mover_deleted_idx" ON "public"."Mover"("deleted");

-- CreateIndex
CREATE INDEX "Mover_lastLoginAt_idx" ON "public"."Mover"("lastLoginAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_opaqueId_key" ON "public"."RefreshToken"("opaqueId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_userType_idx" ON "public"."RefreshToken"("userId", "userType");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_revoked_idx" ON "public"."RefreshToken"("revoked");

-- CreateIndex
CREATE INDEX "CustomerServiceType_customerId_idx" ON "public"."CustomerServiceType"("customerId");

-- CreateIndex
CREATE INDEX "CustomerServiceType_serviceType_idx" ON "public"."CustomerServiceType"("serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerServiceType_customerId_serviceType_key" ON "public"."CustomerServiceType"("customerId", "serviceType");

-- CreateIndex
CREATE INDEX "MoverServiceType_moverId_idx" ON "public"."MoverServiceType"("moverId");

-- CreateIndex
CREATE INDEX "MoverServiceType_serviceType_idx" ON "public"."MoverServiceType"("serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "MoverServiceType_moverId_serviceType_key" ON "public"."MoverServiceType"("moverId", "serviceType");

-- CreateIndex
CREATE INDEX "MoverRegion_moverId_idx" ON "public"."MoverRegion"("moverId");

-- CreateIndex
CREATE INDEX "MoverRegion_region_idx" ON "public"."MoverRegion"("region");

-- CreateIndex
CREATE UNIQUE INDEX "MoverRegion_moverId_region_key" ON "public"."MoverRegion"("moverId", "region");

-- CreateIndex
CREATE INDEX "Likes_customerId_idx" ON "public"."Likes"("customerId");

-- CreateIndex
CREATE INDEX "Likes_moverId_idx" ON "public"."Likes"("moverId");

-- CreateIndex
CREATE INDEX "Likes_createdAt_idx" ON "public"."Likes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Likes_customerId_moverId_key" ON "public"."Likes"("customerId", "moverId");

-- CreateIndex
CREATE INDEX "MoveRequest_customerId_idx" ON "public"."MoveRequest"("customerId");

-- CreateIndex
CREATE INDEX "MoveRequest_serviceType_idx" ON "public"."MoveRequest"("serviceType");

-- CreateIndex
CREATE INDEX "MoveRequest_moveDate_idx" ON "public"."MoveRequest"("moveDate");

-- CreateIndex
CREATE INDEX "MoveRequest_status_idx" ON "public"."MoveRequest"("status");

-- CreateIndex
CREATE INDEX "MoveRequest_customerId_serviceType_idx" ON "public"."MoveRequest"("customerId", "serviceType");

-- CreateIndex
CREATE INDEX "MoveRequest_serviceType_moveDate_idx" ON "public"."MoveRequest"("serviceType", "moveDate");

-- CreateIndex
CREATE INDEX "MoveRequest_status_createdAt_idx" ON "public"."MoveRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MoveRequest_createdAt_idx" ON "public"."MoveRequest"("createdAt");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_moveRequestId_idx" ON "public"."DirectQuoteRequest"("moveRequestId");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_moverId_idx" ON "public"."DirectQuoteRequest"("moverId");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_status_idx" ON "public"."DirectQuoteRequest"("status");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_status_createdAt_idx" ON "public"."DirectQuoteRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DirectQuoteRequest_createdAt_idx" ON "public"."DirectQuoteRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DirectQuoteRequest_moveRequestId_moverId_key" ON "public"."DirectQuoteRequest"("moveRequestId", "moverId");

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
CREATE INDEX "Quote_moveRequestId_status_idx" ON "public"."Quote"("moveRequestId", "status");

-- CreateIndex
CREATE INDEX "Quote_status_createdAt_idx" ON "public"."Quote"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "public"."Quote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_moveRequestId_moverId_type_key" ON "public"."Quote"("moveRequestId", "moverId", "type");

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
CREATE UNIQUE INDEX "Review_customerId_moveRequestId_moverId_key" ON "public"."Review"("customerId", "moveRequestId", "moverId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_moverId_idx" ON "public"."Notification"("moverId");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_priority_idx" ON "public"."Notification"("priority");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_type_idx" ON "public"."Notification"("userId", "type");

-- CreateIndex
CREATE INDEX "Notification_moverId_type_idx" ON "public"."Notification"("moverId", "type");

-- CreateIndex
CREATE INDEX "Notification_expiresAt_idx" ON "public"."Notification"("expiresAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_customerId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_moverId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_moveRequestId_fkey" FOREIGN KEY ("moveRequestId") REFERENCES "public"."MoveRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE SET NULL ON UPDATE CASCADE;
