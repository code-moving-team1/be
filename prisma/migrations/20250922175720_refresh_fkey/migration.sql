-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RefreshToken" DROP CONSTRAINT "RefreshToken_moverId_fkey";

-- AlterTable
ALTER TABLE "public"."RefreshToken" ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "moverId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;
