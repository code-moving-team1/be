/*
  Warnings:

  - The values [pending,accepted,rejected,expired] on the enum `DirectRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,accepted,rejected,expired] on the enum `QuoteStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [normal,direct] on the enum `QuoteType` will be removed. If these variants are still used in the database, this will fail.
  - The values [small,family,office] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.
  - Changed the type of `departure` on the `MoveRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `destination` on the `MoveRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."DirectRequestStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
ALTER TABLE "public"."DirectQuoteRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."DirectQuoteRequest" ALTER COLUMN "status" TYPE "public"."DirectRequestStatus_new" USING ("status"::text::"public"."DirectRequestStatus_new");
ALTER TYPE "public"."DirectRequestStatus" RENAME TO "DirectRequestStatus_old";
ALTER TYPE "public"."DirectRequestStatus_new" RENAME TO "DirectRequestStatus";
DROP TYPE "public"."DirectRequestStatus_old";
ALTER TABLE "public"."DirectQuoteRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuoteStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
ALTER TABLE "public"."Quote" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Quote" ALTER COLUMN "status" TYPE "public"."QuoteStatus_new" USING ("status"::text::"public"."QuoteStatus_new");
ALTER TYPE "public"."QuoteStatus" RENAME TO "QuoteStatus_old";
ALTER TYPE "public"."QuoteStatus_new" RENAME TO "QuoteStatus";
DROP TYPE "public"."QuoteStatus_old";
ALTER TABLE "public"."Quote" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuoteType_new" AS ENUM ('NORMAL', 'DIRECT');
ALTER TABLE "public"."Quote" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Quote" ALTER COLUMN "type" TYPE "public"."QuoteType_new" USING ("type"::text::"public"."QuoteType_new");
ALTER TYPE "public"."QuoteType" RENAME TO "QuoteType_old";
ALTER TYPE "public"."QuoteType_new" RENAME TO "QuoteType";
DROP TYPE "public"."QuoteType_old";
ALTER TABLE "public"."Quote" ALTER COLUMN "type" SET DEFAULT 'NORMAL';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ServiceType_new" AS ENUM ('SMALL', 'FAMILY', 'OFFICE');
ALTER TABLE "public"."CustomerServiceType" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TABLE "public"."MoverServiceType" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TABLE "public"."MoveRequest" ALTER COLUMN "serviceType" TYPE "public"."ServiceType_new" USING ("serviceType"::text::"public"."ServiceType_new");
ALTER TYPE "public"."ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "public"."ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "public"."ServiceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."DirectQuoteRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."MoveRequest" DROP COLUMN "departure",
ADD COLUMN     "departure" "public"."Region" NOT NULL,
DROP COLUMN "destination",
ADD COLUMN     "destination" "public"."Region" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Quote" ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "type" SET DEFAULT 'NORMAL';
