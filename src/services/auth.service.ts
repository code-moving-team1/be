// src/services/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as moverRepo from "../repositories/mover.repository";
import * as customerRepo from "../repositories/customer.repository";
import * as refreshRepo from "../repositories/refresh.repository";
import { UserPlatform, type Customer, type Mover } from "@prisma/client";
import { createError } from "../utils/HttpError";

const JWT_SECRET = process.env.JWT_SECRET as string;
// const ACCESS_EXPIRES_IN = "15m";
// 우진수정 : 개발환경용 120분으로 설정 배포시에는 15분으로 변경하겠습니다
const ACCESS_EXPIRES_IN = "120m";
const REFRESH_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

type UserType = "CUSTOMER" | "MOVER";

type SignUpDto = {
  name: string;
  email: string;
  password: string;
  phone: string;
  img?: string;
  userPlatform?: string;
  googleId?: string;
  naverId?: string;
  kakaoId?: string;
};

type SignInDto = {
  email: string;
  password: string;
  userType: UserType;
};

type OAuthDto = {
  email: string;
  profileImage?: string;
  userType: UserType;
};

type GoogleOAuthDto = OAuthDto & {
  googleId: string;
  firstName: string;
  lastName: string;
};

type NaverOAuthDto = OAuthDto & {
  naverId: string;
  nickname: string;
};

type KakaoOAuthDto = OAuthDto & {
  kakaoId: string;
  username: string;
};

type User = {
  userId: number;
  userType: UserType;
};

type AccessToken = {
  accessToken: string;
};

type Tokens = User &
  AccessToken & {
    refreshToken: string;
  };

export function generateAccessToken(
  userId: number,
  userType: UserType,
  hasProfile: boolean
) {
  return jwt.sign({ id: userId, userType, hasProfile }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

export function generateRefreshToken(
  userId: number,
  userType: UserType,
  hasProfile: boolean
) {
  return jwt.sign({ id: userId, userType, hasProfile }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export async function saveTokens(
  userId: number,
  userType: UserType,
  hasProfile: boolean
) {
  // 토큰 생성
  const accessToken = generateAccessToken(userId, userType, hasProfile);
  const refreshToken = generateRefreshToken(userId, userType, hasProfile);

  // RefreshToken을 별도 테이블에 저장
  await refreshRepo.createRefreshToken(
    userId,
    userType,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    refreshToken
  );

  return { accessToken, refreshToken };
}

function toSafeUser(user: Mover | Customer) {
  const { password, googleId, naverId, kakaoId, ...rest } = user;
  return rest;
}

// 공통 검증 로직
async function validateCommonFields({
  name,
  email,
  phone,
  password,
}: SignUpDto) {
  if (!name || !email || !password || !phone) {
    throw createError("AUTH/VALIDATION", {
      details: { name, email, password, phone },
    });
  }
}

// 이메일 중복 확인
async function checkEmailDuplication(email: string, userType: UserType) {
  const existingUser =
    userType === "MOVER"
      ? await moverRepo.findByEmail(email)
      : await customerRepo.findByEmail(email);

  if (existingUser) {
    throw createError("AUTH/DUPLICATE", {
      messageOverride: "이미 사용 중인 이메일입니다.",
    });
  }
}

// 비밀번호 해싱
async function hashPassword(password: string) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// ⭕ 1
export async function signupMover({ name, email, password, phone }: SignUpDto) {
  // 공통 필드 검증
  await validateCommonFields({ name, email, phone, password });

  // 이메일 중복 확인
  await checkEmailDuplication(email, "MOVER");

  const hashed = await hashPassword(password);
  const mover = await moverRepo.create({
    name,
    email,
    password: hashed,
    phone,
  });

  return toSafeUser(mover);
}

export async function signupCustomer({
  name,
  email,
  password,
  phone,
}: SignUpDto) {
  // 공통 필드 검증
  await validateCommonFields({ name, email, password, phone });

  // 이메일 중복 확인
  await checkEmailDuplication(email, "CUSTOMER");

  const hashed = await hashPassword(password);
  const customer = await customerRepo.create({
    name,
    email,
    password: hashed,
    phone,
  });

  return toSafeUser(customer);
}

// ⭕ 2
export async function signin({
  email,
  password,
  userType,
}: SignInDto): Promise<Tokens> {
  // 사용자 조회
  const user =
    userType === "MOVER"
      ? await moverRepo.findByEmail(email)
      : userType === "CUSTOMER"
      ? await customerRepo.findByEmail(email)
      : "";

  if (!user || !user.password) {
    throw createError("AUTH/EMAIL");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw createError("AUTH/PASSWORD");
  }

  // 토큰 생성 및 refresh db에 저장
  const { accessToken, refreshToken } = await saveTokens(
    user.id,
    userType,
    user.hasProfile
  );

  // 마지막 로그인 시간 업데이트
  if (userType === "MOVER") {
    await moverRepo.updateLastLoginAt(user.id);
  } else {
    await customerRepo.updateLastLoginAt(user.id);
  }

  return {
    accessToken,
    refreshToken,
    userType,
    userId: user.id,
  };
}

// ⭕ 3
export async function refresh(
  refreshToken: string
): Promise<User & AccessToken> {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      id: number;
      userType: "CUSTOMER" | "MOVER";
      hasProfile: boolean;
    };

    // RefreshToken 테이블에서 검증
    const refreshTokenRecord = await refreshRepo.findByUserIdAndUserType(
      decoded.id,
      decoded.userType
    );

    if (!refreshTokenRecord) {
      throw createError("AUTH/UNAUTHORIZED", {
        messageOverride: "리프레쉬 토큰이 유효하지 않습니다.",
      });
    }

    const newAccessToken = generateAccessToken(
      decoded.id,
      decoded.userType,
      decoded.hasProfile
    );
    return {
      accessToken: newAccessToken,
      userType: decoded.userType,
      userId: decoded.id,
    };
  } catch {
    throw createError("AUTH/UNAUTHORIZED", {
      messageOverride: "토큰 갱신에 실패했습니다.",
    });
  }
}

// ⭕ 4
export async function logout(
  userId: number,
  userType: UserType
): Promise<void> {
  // RefreshToken 테이블에서 해당 사용자의 토큰들 무효화
  await refreshRepo.revokeAllByUser(userId, userType);
}

// ⭕ 5
export async function getMe(userId: number, userType: UserType) {
  if (userType === "MOVER") {
    const result = (await moverRepo.findSafeById(userId)) as Mover;
    return toSafeUser(result);
  } else {
    const result = (await customerRepo.findSafeById(userId)) as Customer;
    return toSafeUser(result);
  }
}

// 공통 OAuth 처리 함수
async function handleOAuth({
  email,
  name,
  profileImage,
  userType,
  platform,
  platformId,
}: {
  email: string;
  name: string;
  profileImage?: string | undefined;
  userType: UserType;
  platform: UserPlatform;
  platformId: string;
}) {
  try {
    // 기존 사용자 확인 (이메일로)
    let existingUser: Mover | Customer | null = null;

    if (userType === "MOVER") {
      existingUser = await moverRepo.findByEmail(email);
    } else if (userType === "CUSTOMER") {
      existingUser = await customerRepo.findByEmail(email);
    } else {
      throw createError("AUTH/OAUTH", {
        messageOverride: `${platform} OAuth 로그인에 실패했습니다.`,
      });
    }

    if (existingUser) {
      if (existingUser.userPlatform === platform) {
        return toSafeUser(existingUser);
      } else {
        throw createError("AUTH/ACCOUNT_CONFLICT");
      }
    }

    // 새 사용자 생성
    const randomPassword = Math.random().toString(36).slice(-8); // 임시 비밀번호
    const hashedPassword = await hashPassword(randomPassword);

    if (userType === "MOVER") {
      const mover = await moverRepo.create({
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        name,
        userPlatform: platform,
        platformId,
        img: profileImage || "",
      });

      return toSafeUser(mover);
    } else if (userType === "CUSTOMER") {
      const customer = await customerRepo.create({
        name,
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        userPlatform: platform,
        platformId,
        img: profileImage || "",
      });

      return toSafeUser(customer);
    }
  } catch (error) {
    throw createError("AUTH/OAUTH", {
      messageOverride: `${platform} OAuth 로그인에 실패했습니다.`,
    });
  }
}

// ⭕ 6 - Google OAuth
export async function googleOAuth({
  googleId,
  email,
  firstName,
  lastName,
  profileImage,
  userType,
}: GoogleOAuthDto) {
  const fullName = `${firstName} ${lastName}`.trim();

  return handleOAuth({
    email,
    name: fullName,
    profileImage: profileImage || undefined,
    userType,
    platform: "GOOGLE",
    platformId: googleId,
  });
}

// ⭕ 7 - 네이버 OAuth
export async function naverOAuth({
  naverId,
  email,
  nickname,
  profileImage,
  userType,
}: NaverOAuthDto) {
  return handleOAuth({
    email,
    name: nickname,
    profileImage: profileImage || undefined,
    userType,
    platform: "NAVER",
    platformId: naverId,
  });
}

// ⭕ 8 - 카카오 OAuth
export async function kakaoOAuth({
  kakaoId,
  email,
  username,
  profileImage,
  userType,
}: KakaoOAuthDto) {
  return handleOAuth({
    email,
    name: username,
    profileImage: profileImage || undefined,
    userType,
    platform: "KAKAO",
    platformId: kakaoId,
  });
}

export default {
  signupMover,
  signupCustomer,
  signin,
  refresh,
  logout,
  getMe,
  googleOAuth,
  naverOAuth,
  kakaoOAuth,
};
