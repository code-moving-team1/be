/*
  Warnings:

  - Added the required column `name` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Mover` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "hasProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(50) NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Mover" ADD COLUMN     "hasProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" VARCHAR(50) NOT NULL,
ALTER COLUMN "nickname" DROP NOT NULL,
ALTER COLUMN "career" DROP NOT NULL,
ALTER COLUMN "introduction" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
