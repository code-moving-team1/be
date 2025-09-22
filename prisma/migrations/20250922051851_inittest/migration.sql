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
