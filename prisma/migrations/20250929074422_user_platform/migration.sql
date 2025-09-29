-- CreateEnum
CREATE TYPE "public"."UserPlatform" AS ENUM ('NORMAL', 'GOOGLE', 'NAVER', 'KAKAO');

-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "userPlatform" "public"."UserPlatform" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "public"."Mover" ADD COLUMN     "userPlatform" "public"."UserPlatform" NOT NULL DEFAULT 'NORMAL';
