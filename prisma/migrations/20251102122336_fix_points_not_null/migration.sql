/*
  Warnings:

  - Made the column `points` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `points` on table `Mover` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Customer" ALTER COLUMN "points" SET NOT NULL,
ALTER COLUMN "points" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Mover" ALTER COLUMN "points" SET NOT NULL,
ALTER COLUMN "points" SET DEFAULT 0;
