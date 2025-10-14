import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as moverRepo from "../repositories/mover.repository";
import * as customerRepo from "../repositories/customer.repository";
import * as refreshRepo from "../repositories/refresh.repository";
import { type Customer, type Mover } from "@prisma/client";
import { createError } from "../utils/HttpError";

const JWT_SECRET = process.env.JWT_SECRET as string;
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

type UserType = "CUSTOMER" | "MOVER";

type SignUpDto = {
  email: string;
  password: string;
  phone: string;
  serviceTypes: string[] | [];
  img?: string;
};

type SignUpCustomerDto = SignUpDto & {
  region: string;
};

type SignUpMoverDto = SignUpDto & {
  nickname: string;
  career: string;
  introduction: string;
  description: string;
  moverRegions: string[];
};

type SignInDto = {
  email: string;
  password: string;
  userType: UserType;
};

type GoogleOAuthDto = {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  userType: UserType;
};

type NaverOAuthDto = {
  naverId: string;
  email: string;
  nickname: string;
  profileImage?: string;
  userType: UserType;
};

type KakaoOAuthDto = {
  kakaoId: string;
  email: string;
  username: string;
  profileImage?: string;
  userType: UserType;
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

export function generateAccessToken(user: { id: number }, userType: UserType) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

export function generateRefreshToken(user: { id: number }, userType: UserType) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

export async function saveTokens(userId: number, userType: UserType) {
  const user = { id: userId };

  // 토큰 생성
  const accessToken = generateAccessToken(user, userType);
  const refreshToken = generateRefreshToken(user, userType);

  // RefreshToken을 별도 테이블에 저장
  await refreshRepo.createRefreshToken(
    user.id,
    userType,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    refreshToken
  );

  return { accessToken, refreshToken };
}

function toSafeUser(user: Mover | Customer) {
  const { password, ...rest } = user;
  return rest;
}

// 공통 검증 로직
async function validateCommonFields(
  email: string,
  password: string,
  phone: string
) {
  if (!email || !password || !phone) {
    throw createError("AUTH/VALIDATION", {
      details: { email, password, phone },
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
export async function signupMover({
  email,
  password,
  phone,
  nickname,
  career,
  introduction,
  description,
  moverRegions,
  serviceTypes,
  img,
}: SignUpMoverDto) {
  // 공통 필드 검증
  await validateCommonFields(email, password, phone);

  // Mover 전용 필드 검증
  if (!nickname || !career || !introduction || !description) {
    throw createError("AUTH/VALIDATION", {
      details: { nickname, career, introduction, description },
    });
  }

  // 이메일 중복 확인
  await checkEmailDuplication(email, "MOVER");

  // 닉네임 중복 확인
  const existingNickname = await moverRepo.findByNickname(nickname);
  if (existingNickname) {
    throw createError("AUTH/DUPLICATE", {
      messageOverride: "이미 사용 중인 닉네임입니다.",
    });
  }

  const hashed = await hashPassword(password);
  const mover = await moverRepo.create({
    email,
    password: hashed,
    phone,
    nickname,
    career,
    introduction,
    description,
    moverRegions,
    serviceTypes,
    img,
  } as SignUpMoverDto);

  return toSafeUser(mover);
}

export async function signupCustomer({
  email,
  password,
  phone,
  region,
  serviceTypes,
  img,
}: SignUpCustomerDto) {
  // 공통 필드 검증
  await validateCommonFields(email, password, phone);

  // Customer 전용 필드 검증
  if (!region) {
    throw createError("AUTH/VALIDATION", {
      details: { region },
    });
  }

  // 이메일 중복 확인
  await checkEmailDuplication(email, "CUSTOMER");

  const hashed = await hashPassword(password);
  const customer = await customerRepo.create({
    email,
    password: hashed,
    phone,
    region,
    serviceTypes,
    img,
  } as SignUpCustomerDto);

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
  const { accessToken, refreshToken } = await saveTokens(user.id, userType);

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
      { id: decoded.id },
      decoded.userType
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

// ⭕ 6 - Google OAuth
export async function googleOAuth({
  googleId,
  email,
  firstName,
  lastName,
  profileImage,
  userType,
}: GoogleOAuthDto) {
  try {
    // 기존 사용자 확인 (이메일로)
    let existingUser: Mover | Customer | null = null;

    if (userType === "MOVER") {
      existingUser = await moverRepo.findByEmail(email);
    } else if (userType === "CUSTOMER") {
      existingUser = await customerRepo.findByEmail(email);
    } else {
      throw createError("AUTH/GOOGLE_OAUTH", {
        messageOverride: "Google OAuth 로그인에 실패했습니다.",
      });
    }

    if (existingUser) {
      if (existingUser.userPlatform === "GOOGLE") {
        return toSafeUser(existingUser);
      } else {
        throw createError("AUTH/ACCOUNT_CONFLICT");
      }
    }

    // 새 사용자 생성
    const fullName = `${firstName} ${lastName}`.trim();
    const randomPassword = Math.random().toString(36).slice(-8); // 임시 비밀번호
    const hashedPassword = await hashPassword(randomPassword);

    if (userType === "MOVER") {
      // Mover 생성 (Google OAuth용 기본값 설정)
      const mover = await moverRepo.create({
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        nickname: fullName, // 기본 닉네임
        career: "신규", // 기본값
        introduction: "Google OAuth로 가입한 사용자입니다.", // 기본값
        description: "Google OAuth로 가입한 사용자입니다.", // 기본값
        moverRegions: [], // 빈 배열
        serviceTypes: [], // 빈 배열
        userPlatform: "GOOGLE",
        googleId: googleId, // Google ID 저장
        img: profileImage,
      } as any);

      return toSafeUser(mover);
    } else if (userType === "CUSTOMER") {
      const customer = await customerRepo.create({
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        region: "서울", // 기본값, 나중에 업데이트 필요
        serviceTypes: [], // 빈 배열
        userPlatform: "GOOGLE",
        googleId: googleId, // Google ID 저장
        img: profileImage,
      } as any);

      return toSafeUser(customer);
    }
  } catch (error) {
    throw createError("AUTH/GOOGLE_OAUTH", {
      messageOverride: "Google OAuth 로그인에 실패했습니다.",
    });
  }
}

// ⭕ 7 - 네이버 OAuth
export async function naverOAuth({
  naverId,
  email,
  nickname,
  profileImage,
  userType,
}: NaverOAuthDto) {
  try {
    // 기존 사용자 확인 (이메일로)
    let existingUser: Mover | Customer | null = null;

    if (userType === "MOVER") {
      existingUser = await moverRepo.findByEmail(email);
    } else if (userType === "CUSTOMER") {
      existingUser = await customerRepo.findByEmail(email);
    } else {
      throw createError("AUTH/NAVER_OAUTH", {
        messageOverride: "Naver OAuth 로그인에 실패했습니다.",
      });
    }

    if (existingUser) {
      if (existingUser.userPlatform === "NAVER") {
        return toSafeUser(existingUser);
      } else {
        throw createError("AUTH/ACCOUNT_CONFLICT");
      }
    }

    // 새 사용자 생성
    const randomPassword = Math.random().toString(36).slice(-8); // 임시 비밀번호
    const hashedPassword = await hashPassword(randomPassword);

    if (userType === "MOVER") {
      // Mover 생성 (Naver OAuth용 기본값 설정)
      const mover = await moverRepo.create({
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        nickname: nickname, // Naver 닉네임 사용
        career: "신규", // 기본값
        introduction: "Naver OAuth로 가입한 사용자입니다.", // 기본값
        description: "Naver OAuth로 가입한 사용자입니다.", // 기본값
        moverRegions: [], // 빈 배열
        serviceTypes: [], // 빈 배열
        userPlatform: "NAVER",
        naverId: naverId, // Naver ID 저장
        img: profileImage,
      } as any);

      return toSafeUser(mover);
    } else if (userType === "CUSTOMER") {
      const customer = await customerRepo.create({
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        region: "서울", // 기본값, 나중에 업데이트 필요
        serviceTypes: [], // 빈 배열
        userPlatform: "NAVER",
        naverId: naverId, // Naver ID 저장
        img: profileImage,
      } as any);

      return toSafeUser(customer);
    }
  } catch (error) {
    throw createError("AUTH/NAVER_OAUTH", {
      messageOverride: "Naver OAuth 로그인에 실패했습니다.",
    });
  }
}

// ⭕ 8 - 카카오 OAuth
export async function kakaoOAuth({
  kakaoId,
  email,
  username,
  profileImage,
  userType,
}: KakaoOAuthDto) {
  try {
    // 기존 사용자 확인 (이메일로)
    let existingUser: Mover | Customer | null = null;

    if (userType === "MOVER") {
      existingUser = await moverRepo.findByEmail(email);
    } else if (userType === "CUSTOMER") {
      existingUser = await customerRepo.findByEmail(email);
    } else {
      throw createError("AUTH/KAKAO_OAUTH", {
        messageOverride: "Kakao OAuth 로그인에 실패했습니다.",
      });
    }

    if (existingUser) {
      if (existingUser.userPlatform === "KAKAO") {
        return toSafeUser(existingUser);
      } else {
        throw createError("AUTH/ACCOUNT_CONFLICT");
      }
    }

    const randomPassword = Math.random().toString(36).slice(-8); // 임시 비밀번호
    const hashedPassword = await hashPassword(randomPassword);

    if (userType === "MOVER") {
      // Mover 생성 (Kakao OAuth용 기본값 설정)
      const mover = await moverRepo.create({
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        nickname: username, // 기본 닉네임
        career: "신규", // 기본값
        introduction: "Kakao OAuth로 가입한 사용자입니다.", // 기본값
        description: "Kakao OAuth로 가입한 사용자입니다.", // 기본값
        moverRegions: [], // 빈 배열
        serviceTypes: [], // 빈 배열
        userPlatform: "KAKAO",
        kakaoId: kakaoId, // Kakao ID 저장
        img: profileImage,
      } as any);

      return toSafeUser(mover);
    } else if (userType === "CUSTOMER") {
      const customer = await customerRepo.create({
        email,
        password: hashedPassword,
        phone: "00000000000", // 기본값, 나중에 업데이트 필요
        region: "서울", // 기본값, 나중에 업데이트 필요
        serviceTypes: [], // 빈 배열
        userPlatform: "KAKAO",
        kakaoId: kakaoId, // Kakao ID 저장
        img: profileImage,
      } as any);

      return toSafeUser(customer);
    }
  } catch (error) {
    throw createError("AUTH/KAKAO_OAUTH", {
      messageOverride: "Kakao OAuth 로그인에 실패했습니다.",
    });
  }
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
