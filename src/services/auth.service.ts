import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as moverRepo from "../repositories/mover.repository";
import * as customerRepo from "../repositories/customer.repository";
import * as refreshRepo from "../repositories/refresh.repository";
import type { Customer, Mover } from "@prisma/client";
import { createError } from "../utils/HttpError";

const JWT_SECRET = process.env.JWT_SECRET as string;
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

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
  userType: "CUSTOMER" | "MOVER";
};

type User = {
  userId: number;
  userType: "CUSTOMER" | "MOVER";
};

type AccessToken = {
  accessToken: string;
};

type Tokens = User &
  AccessToken & {
    refreshToken: string;
  };

function generateAccessToken(
  user: { id: number },
  userType: "CUSTOMER" | "MOVER"
) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

function generateRefreshToken(
  user: { id: number },
  userType: "CUSTOMER" | "MOVER"
) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
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
async function checkEmailDuplication(
  email: string,
  userType: "CUSTOMER" | "MOVER"
) {
  const existingUser =
    userType === "MOVER"
      ? await moverRepo.findByEmail(email)
      : await customerRepo.findByEmail(email);

  if (existingUser) {
    throw createError(409, "이미 등록된 이메일입니다.", "email");
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
    throw createError("AUTH/NICKNAME", { details: { existingNickname } });
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
    throw new HttpError(400, "필수 항목 누락!", "validation");
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
    throw new HttpError(401, "존재하지 않는 이메일입니다.", "email");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new HttpError(401, "잘못된 비밀번호 입니다.", "password");
  }

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
      throw new HttpError(401, "유효하지 않은 리프레시 토큰입니다.", "auth");
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
    throw new HttpError(401, "토큰 갱신 실패!", "auth");
  }
}

// ⭕ 4
export async function logout(
  userId: number,
  userType: "CUSTOMER" | "MOVER"
): Promise<void> {
  // RefreshToken 테이블에서 해당 사용자의 토큰들 무효화
  await refreshRepo.revokeAllByUser(userId, userType);
}

// ⭕ 5
export async function getMe(userId: number, userType: "CUSTOMER" | "MOVER") {
  if (userType === "MOVER") {
    const result = (await moverRepo.findSafeById(userId)) as Mover;
    return toSafeUser(result);
  } else {
    const result = (await customerRepo.findSafeById(userId)) as Customer;
    return toSafeUser(result);
  }
}

export default {
  signupMover,
  signupCustomer,
  signin,
  refresh,
  logout,
  getMe,
};
