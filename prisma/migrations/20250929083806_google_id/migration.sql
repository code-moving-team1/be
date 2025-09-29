/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `Mover` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "googleId" VARCHAR(255);

-- AlterTable
ALTER TABLE "public"."Mover" ADD COLUMN     "googleId" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_googleId_key" ON "public"."Customer"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Mover_googleId_key" ON "public"."Mover"("googleId");
