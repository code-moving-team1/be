import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as moverRepo from "../repositories/mover.repository";
import * as customerRepo from "../repositories/customer.repository";
import type { Mover } from "@prisma/client";
import type { SafeUser } from "../types/domain.js";
import HttpError from "../utiles/HttpError.js";

type SignUpDto = {
  email: string;
  password: string;
  phone: string;
  nickname: string;
  career: string;
  introduction: string;
  description: string;
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
  user: Pick<Mover, "id">,
  userType: "CUSTOMER" | "MOVER"
) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
}

function generateRefreshToken(
  user: Pick<Mover, "id">,
  userType: "CUSTOMER" | "MOVER"
) {
  return jwt.sign({ id: user.id, userType }, JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

function toSafeUser(mover: Mover): SafeUser {
  return {
    id: mover.id,
    email: mover.email,
    phone: mover.phone,
    img: mover.img,
    nickname: mover.nickname,
    career: mover.career,
    introduction: mover.introduction,
    description: mover.description,
    averageRating: mover.averageRating,
    totalReviews: mover.totalReviews,
    createdAt: mover.createdAt,
  };
}

export async function signup({
  email,
  password,
  phone,
  nickname,
  career,
  introduction,
  description,
  img,
}: SignUpDto): Promise<SafeUser> {
  if (
    !email ||
    !password ||
    !phone ||
    !nickname ||
    !career ||
    !introduction ||
    !description
  ) {
    throw new HttpError(400, "필수 항목 누락!", "validation");
  }

  // Customer와 Mover 모두에서 이메일 중복 확인
  const existingCustomer = await customerRepo.findByEmail(email);
  const existingMover = await moverRepo.findByEmail(email);

  if (existingCustomer || existingMover) {
    throw new HttpError(409, "이미 등록된 이메일입니다.", "email");
  }

  // 닉네임 중복 확인
  const existingNickname = await moverRepo.findByNickname(nickname);
  if (existingNickname) {
    throw new HttpError(409, "이미 사용 중인 닉네임입니다.", "nickname");
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const mover = await moverRepo.create({
    email,
    password: hashed,
    phone,
    nickname,
    career,
    introduction,
    description,
    img,
  });

  return toSafeUser(mover);
}

export async function signin({
  email,
  password,
  userType,
}: SignInDto): Promise<Tokens> {
  let user: Mover | null = null;

  if (userType === "MOVER") {
    user = await moverRepo.findByEmail(email);
  } else {
    // CUSTOMER 타입인 경우 Customer 테이블에서 찾기
    const customer = await customerRepo.findByEmail(email);
    if (customer) {
      // Mover 타입으로 변환 (공통 인터페이스 사용)
      user = {
        id: customer.id,
        email: customer.email,
        password: customer.password,
        phone: customer.phone,
        img: customer.img,
        nickname: "", // Customer는 nickname이 없으므로 기본값
        career: "",
        introduction: "",
        description: "",
        averageRating: 0,
        totalReviews: 0,
        isActive: customer.isActive,
        deleted: customer.deleted,
        lastLoginAt: customer.lastLoginAt,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      } as Mover;
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
  if (userType === "MOVER") {
    return moverRepo.findSafeById(id);
  } else {
    return customerRepo.findSafeById(id);
  }
}

// Mover 전용 함수들
export async function updateProfile(
  id: number,
  data: {
    nickname?: string;
    career?: string;
    introduction?: string;
    description?: string;
    img?: string;
  }
): Promise<SafeUser> {
  const mover = await moverRepo.update(id, data);
  return toSafeUser(mover);
}

export async function getMoversByRegion(region: string): Promise<SafeUser[]> {
  const movers = await moverRepo.findByRegion(region);
  return movers.map(toSafeUser);
}

export async function getMoversByServiceType(
  serviceType: string
): Promise<SafeUser[]> {
  const movers = await moverRepo.findByServiceType(serviceType);
  return movers.map(toSafeUser);
}

export async function getTopRatedMovers(
  minRating: number = 4.0
): Promise<SafeUser[]> {
  const movers = await moverRepo.findByRating(minRating);
  return movers.map(toSafeUser);
}

export default {
  signup,
  signin,
  refresh,
  logout,
  getMe,
  updateProfile,
  getMoversByRegion,
  getMoversByServiceType,
  getTopRatedMovers,
};
