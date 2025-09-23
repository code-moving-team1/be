import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import type { UserType } from "@prisma/client";

// 1. 리프레쉬 토큰 생성
export async function createRefreshToken(
  userId: number,
  userType: UserType,
  expiresAt: Date,
  refreshToken: string
) {
  const hashed = (await bcrypt.hash(refreshToken, 12)) as string;
  return await prisma.refreshToken.create({
    data: {
      userId,
      userType,
      hashed,
      expiresAt,
      ...(userType === "CUSTOMER"
        ? { customerId: userId, moverId: null }
        : { moverId: userId, customerId: null }),
    },
  });
}

// 2. 리프레쉬 토큰 찾기
export async function findByUserIdAndUserType(
  userId: number,
  userType: UserType
) {
  return await prisma.refreshToken.findFirst({
    where: {
      userId,
      userType,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function revokeById(id: number) {
  return prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
}

export async function revokeAllByUser(userId: number, userType: UserType) {
  return prisma.refreshToken.updateMany({
    where: { userId, userType, revoked: false },
    data: { revoked: true },
  });
}

export async function isSameRawToken(hashed: string, raw: string) {
  return bcrypt.compare(raw, hashed);
}

// Sliding
export async function saveSlidingRT(
  userId: number,
  userType: UserType,
  opaqueId: string,
  refreshToken: string,
  userAgent: string,
  ip: string,
  expiresAt: Date
) {
  const hashed = (await bcrypt.hash(refreshToken, 12)) as string;
  return prisma.refreshToken.create({
    data: {
      userId,
      userType,
      opaqueId,
      hashed,
      userAgent,
      ip,
      expiresAt,
      lastUsedAt: new Date(),
      ...(userType === "CUSTOMER"
        ? { customerId: userId, moverId: null }
        : { moverId: userId, customerId: null }),
    },
  });
}

export async function findByOpaqueId(opaqueId: string) {
  return prisma.refreshToken.findUnique({ where: { opaqueId } });
}

export async function updateSlidingOnUse(
  id: number,
  { extendsMs }: { extendsMs: number }
) {
  const now = Date.now();
  return prisma.refreshToken.update({
    where: { id },
    data: { lastUsedAt: new Date(now), expiresAt: new Date(now + extendsMs) },
  });
}

export default {
  createRefreshToken,
  revokeById,
  revokeAllByUser,
  findByUserIdAndUserType,
  isSameRawToken,
  saveSlidingRT,
  findByOpaqueId,
  updateSlidingOnUse,
};
