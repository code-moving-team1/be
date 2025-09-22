import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import * as moverRepo from "../repositories/mover.repository";
import * as customerRepo from "../repositories/customer.repository";
import * as refreshRepo from "../repositories/refresh.repository";
import type { Mover } from "@prisma/client";
import type { SafeMover, SafeCustomer } from "../types/domain";
import HttpError from "../utils/HttpError";

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

function toSafeMover(mover: Mover) {
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
  } as SafeMover;
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
}: SignUpDto): Promise<SafeMover> {
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

  // 이메일 중복 확인
  // 하나의 이메일로 customer와 mover 모두 가입이 가능한 상황 (지금은)
  const existingMover = await moverRepo.findByEmail(email);
  if (existingMover) {
    throw new HttpError(409, "이미 등록된 이메일입니다.", "email");
  }

  // 닉네임 중복 확인
  const existingNickname = await moverRepo.findByNickname(nickname);
  if (existingNickname) {
    throw new HttpError(409, "이미 사용 중인 닉네임입니다.");
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
  } as SignUpDto);
  
  return toSafeMover(mover);
}

export async function signin({
  email,
  password,
}: SignInDto): Promise<Tokens> {
    const mover = await moverRepo.findByEmail(email);

  if (!mover || !mover.password) {
    throw new HttpError(401, "존재하지 않는 이메일입니다.", "email");
  }

  const valid = await bcrypt.compare(password, mover.password);
  if (!valid) {
    throw new HttpError(401, "잘못된 비밀번호 입니다.", "password");
  }

  const accessToken = generateAccessToken(mover, "MOVER");
  const refreshToken = generateRefreshToken(mover, "MOVER");

  // RefreshToken을 별도 테이블에 저장
  // expiresAt: 7일 후로 임의로 지정했습니다
  await refreshRepo.createRefreshToken(mover.id, "MOVER", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), refreshToken);

  // 마지막 로그인 시간 업데이트
  await moverRepo.updateLastLoginAt(mover.id);

  return {
    accessToken,
    refreshToken,
    userType: "MOVER",
    userId: mover.id,
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
    const refreshTokenRecord = await refreshRepo.findByUserIdAndUserType(decoded.id, decoded.userType);
    
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

export async function logout(
  userId: number,
  userType: "CUSTOMER" | "MOVER"
): Promise<void> {
  // RefreshToken 테이블에서 해당 사용자의 토큰들 무효화
  await refreshRepo.revokeAllByUser(userId, userType);
}

export function getMe(
  id: number,
  userType: "CUSTOMER" | "MOVER"
): Promise<SafeMover | SafeCustomer | null> {
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
): Promise<SafeMover> {
  const mover = await moverRepo.update(id, data);
  return toSafeMover(mover);
}

export async function getMoversByRegion(region: string): Promise<SafeMover[]> {
  const movers = await moverRepo.findByRegion(region);
  return movers.map(toSafeMover);
}

export async function getMoversByServiceType(
  serviceType: string
): Promise<SafeMover[]> {
  const movers = await moverRepo.findByServiceType(serviceType);
  return movers.map(toSafeMover);
}

export async function getTopRatedMovers(
  minRating: number = 4.0
): Promise<SafeMover[]> {
  const movers = await moverRepo.findByRating(minRating);
  return movers.map(toSafeMover);
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
