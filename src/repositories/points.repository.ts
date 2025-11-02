// src/repositories/points.repository.ts
import { prisma } from "../lib/prisma";

export type UserType = "CUSTOMER" | "MOVER";

export const PointsRepository = {
  async incrementUserPoints(userId: number, userType: UserType, amount: number) {
    if (userType === "CUSTOMER") {
      return prisma.customer.update({
        where: { id: userId },
        data: { points: { increment: amount } },
        select: { id: true, points: true },
      });
    }
    return prisma.mover.update({
      where: { id: userId },
      data: { points: { increment: amount } },
      select: { id: true, points: true },
    });
  },
};
