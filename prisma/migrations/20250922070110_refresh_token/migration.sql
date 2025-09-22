/*
  Warnings:

  - Added the required column `departureRegion` to the `MoveRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationRegion` to the `MoveRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `departure` on the `MoveRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `destination` on the `MoveRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."MoveRequest" ADD COLUMN     "departureRegion" TEXT NOT NULL,
ADD COLUMN     "destinationRegion" TEXT NOT NULL,
DROP COLUMN "departure",
ADD COLUMN     "departure" VARCHAR(200) NOT NULL,
DROP COLUMN "destination",
ADD COLUMN     "destination" VARCHAR(200) NOT NULL;

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userType" "public"."UserType" NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_opaqueId_key" ON "public"."RefreshToken"("opaqueId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_userType_idx" ON "public"."RefreshToken"("userId", "userType");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_revoked_idx" ON "public"."RefreshToken"("revoked");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_customerId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_moverId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;
