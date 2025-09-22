/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `Mover` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Mover_nickname_key" ON "public"."Mover"("nickname");
