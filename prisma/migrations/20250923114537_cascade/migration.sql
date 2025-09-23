-- DropForeignKey
ALTER TABLE "public"."CustomerServiceType" DROP CONSTRAINT "CustomerServiceType_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Likes" DROP CONSTRAINT "Likes_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Likes" DROP CONSTRAINT "Likes_moverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MoverRegion" DROP CONSTRAINT "MoverRegion_moverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MoverServiceType" DROP CONSTRAINT "MoverServiceType_moverId_fkey";

-- AddForeignKey
ALTER TABLE "public"."CustomerServiceType" ADD CONSTRAINT "CustomerServiceType_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MoverServiceType" ADD CONSTRAINT "MoverServiceType_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MoverRegion" ADD CONSTRAINT "MoverRegion_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Likes" ADD CONSTRAINT "Likes_moverId_fkey" FOREIGN KEY ("moverId") REFERENCES "public"."Mover"("id") ON DELETE CASCADE ON UPDATE CASCADE;
