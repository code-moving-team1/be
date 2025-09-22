import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as customerRepo from "../repositories/customer.repository";
import * as moverRepo from "../repositories/mover.repository";
import type { Customer } from "@prisma/client";
import type { SafeUser } from "../types/domain.js";
import HttpError from "../utiles/HttpError.js";

type SignUpDto = {
  email: string;
  password: string;
  phone: string;
  region: string;
  img?: string;
};

type SignInDto = {
  email: string;
  password: string;
  userType: "CUSTOMER" | "MOVER";
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
  userType: "CUSTOMER" | "MOVER";
  userId: number;
};

const JWT_SECRET = process.env.JWT_SECRET as string;
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

function generateAccessToken(
  user: Pick<Customer, "id">,
  userType: "CUSTOMER" | "MOVER"
) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

function generateRefreshToken(
  user: Pick<Customer, "id">,
  userType: "CUSTOMER" | "MOVER"
) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

function toSafeUser(customer: Customer): SafeUser {
  return {
    id: customer.id,
    email: customer.email,
    phone: customer.phone,
    img: customer.img,
    region: customer.region,
    createdAt: customer.createdAt,
  };
}

export async function signup({
  email,
  password,
  phone,
  region,
  img,
}: SignUpDto): Promise<SafeUser> {
  if (!email || !password || !phone || !region) {
    throw new HttpError(400, "필수 항목 누락!", "validation");
  }

  // Customer와 Mover 모두에서 이메일 중복 확인
  const existingCustomer = await customerRepo.findByEmail(email);
  const existingMover = await moverRepo.findByEmail(email);

  if (existingCustomer || existingMover) {
    throw new HttpError(409, "이미 등록된 이메일입니다.", "email");
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const customer = await customerRepo.create({
    email,
    password: hashed,
    phone,
    region,
    img,
  });

  return toSafeUser(customer);
}

export async function signin({
  email,
  password,
  userType,
}: SignInDto): Promise<Tokens> {
  let user: Customer | null = null;

  if (userType === "CUSTOMER") {
    user = await customerRepo.findByEmail(email);
  } else {
    // MOVER 타입인 경우 Mover 테이블에서 찾기
    const mover = await moverRepo.findByEmail(email);
    if (mover) {
      // Customer 타입으로 변환 (공통 인터페이스 사용)
      user = {
        id: mover.id,
        email: mover.email,
        password: mover.password,
        phone: mover.phone,
        img: mover.img,
        region: "서울" as any, // Mover는 region이 없으므로 기본값
        isActive: mover.isActive,
        deleted: mover.deleted,
        lastLoginAt: mover.lastLoginAt,
        createdAt: mover.createdAt,
        updatedAt: mover.updatedAt,
      } as Customer;
    }
  }

  if (!user || !user.password) {
    throw new HttpError(401, "존재하지 않는 이메일입니다.", "email");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new HttpError(401, "잘못된 비밀번호 입니다.", "password");
  }

  const accessToken = generateAccessToken(user, userType);
  const refreshToken = generateRefreshToken(user, userType);

  // RefreshToken을 별도 테이블에 저장
  // TODO: RefreshToken 저장 로직 구현 필요

  // 마지막 로그인 시간 업데이트
  if (userType === "CUSTOMER") {
    await customerRepo.updateLastLoginAt(user.id);
  } else {
    await moverRepo.updateLastLoginAt(user.id);
  }

  return {
    accessToken,
    refreshToken,
    userType,
    userId: user.id,
  };
}

export async function refresh(refreshToken: string): Promise<{
  accessToken: string;
  userType: "CUSTOMER" | "MOVER";
  userId: number;
}> {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      id: number;
      userType: "CUSTOMER" | "MOVER";
    };

    // RefreshToken 테이블에서 검증
    // TODO: RefreshToken 검증 로직 구현 필요

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

export async function logout(
  userId: number,
  userType: "CUSTOMER" | "MOVER"
): Promise<void> {
  // RefreshToken 테이블에서 해당 사용자의 토큰들 무효화
  // TODO: RefreshToken 무효화 로직 구현 필요
}

export function getMe(
  id: number,
  userType: "CUSTOMER" | "MOVER"
): Promise<SafeUser | null> {
  if (userType === "CUSTOMER") {
    return customerRepo.findSafeById(id);
  } else {
    return moverRepo.findSafeById(id);
  }
}

export default {
  signup,
  signin,
  refresh,
  logout,
  getMe,
};
