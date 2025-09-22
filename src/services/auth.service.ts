import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import type { UserType } from "@prisma/client";
import HttpError from "../utiles/HttpError.js";

type Tokens = {
  accessToken: string;
  refreshToken: string;
  userType: UserType;
  userId: number;
};

const JWT_SECRET = process.env.JWT_SECRET as string;
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

function generateAccessToken(userId: number, userType: UserType) {
  return jwt.sign({ id: userId, userType }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

function generateRefreshToken(userId: number, userType: UserType) {
  return jwt.sign({ id: userId, userType }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export async function createRefreshToken(
  userId: number,
  userType: UserType,
  userAgent?: string,
  ip?: string
): Promise<string> {
  const refreshToken = generateRefreshToken(userId, userType);

  // RefreshToken 테이블에 저장
  await prisma.refreshToken.create({
    data: {
      userId,
      userType,
      opaqueId: refreshToken, // JWT 토큰을 opaqueId로 저장
      userAgent,
      ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
    },
  });

  return refreshToken;
}

export async function verifyRefreshToken(refreshToken: string): Promise<{
  userId: number;
  userType: UserType;
}> {
  try {
    // JWT 토큰 검증
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      id: number;
      userType: UserType;
    };

    // RefreshToken 테이블에서 검증
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        opaqueId: refreshToken,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!tokenRecord) {
      throw new HttpError(401, "RefreshToken이 유효하지 않습니다.", "auth");
    }

    // 마지막 사용 시간 업데이트
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      userId: decoded.id,
      userType: decoded.userType,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(401, "토큰 검증 실패!", "auth");
  }
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      opaqueId: refreshToken,
    },
    data: {
      revoked: true,
    },
  });
}

export async function revokeAllUserTokens(
  userId: number,
  userType: UserType
): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      userType,
    },
    data: {
      revoked: true,
    },
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  userType: UserType;
  userId: number;
}> {
  const { userId, userType } = await verifyRefreshToken(refreshToken);

  const accessToken = generateAccessToken(userId, userType);

  return {
    accessToken,
    userType,
    userId,
  };
}

export async function cleanupExpiredTokens(): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

export default {
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  refreshAccessToken,
  cleanupExpiredTokens,
};
