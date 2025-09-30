import { prisma } from "../lib/prisma";
import { Region, ServiceType, UserPlatform, type Prisma } from "@prisma/client";

// 정렬 옵션 타입 정의
export type SortOption = "reviews" | "rating" | "career" | "quotes";

// 검색 필터 타입 정의
export interface MoverListFilters {
  regions?: Region[];
  serviceTypes?: ServiceType[];
  searchText?: string;
  sortBy?: SortOption;
  sortOrder?: "asc" | "desc";
}

export async function findById(id: number) {
  return prisma.mover.findUnique({
    where: {
      id,
      deleted: false,
    },
  });
}

export async function findByEmail(email: string) {
  return prisma.mover.findUnique({ where: { email, deleted: false } });
}

export async function findByNickname(nickname: string) {
  return prisma.mover.findFirst({ where: { nickname, deleted: false } });
}

export async function findByGoogleId(googleId: string) {
  return prisma.mover.findFirst({
    where: {
      googleId,
      deleted: false,
    },
  });
}

export async function findSafeById(id: number) {
  const raw = await prisma.mover.findUnique({
    where: { id: Number(id), deleted: false },
    include: { moverRegions: true, moverServiceTypes: true },
  });
  return {
    ...raw,
    moverRegions: raw?.moverRegions.map((region) => region.region),
    moverServiceTypes: raw?.moverServiceTypes.map(
      (serviceType) => serviceType.serviceType
    ),
  };
}

export async function create(mover: {
  email: string;
  password: string;
  phone: string;
  nickname: string;
  career: string;
  introduction: string;
  description: string;
  moverRegions: string[];
  serviceTypes: string[];
  userPlatform?: UserPlatform;
  googleId?: string;
  naverId?: string;
  kakaoId?: string;
  img?: string;
}) {
  const result = await prisma.mover.create({
    data: {
      email: mover.email,
      password: mover.password,
      phone: mover.phone,
      nickname: mover.nickname,
      career: mover.career,
      introduction: mover.introduction,
      description: mover.description,
      ...(mover.userPlatform ? { userPlatform: mover.userPlatform } : {}),
      ...(mover.googleId ? { googleId: mover.googleId } : {}),
      ...(mover.naverId ? { naverId: mover.naverId } : {}),
      ...(mover.kakaoId ? { kakaoId: mover.kakaoId } : {}),
      ...(mover.img !== undefined ? { img: mover.img } : {}),
    },
  });
  const regionResult = await Promise.all(
    mover.moverRegions.map((rawRegion) => {
      return prisma.moverRegion.create({
        data: {
          moverId: result.id,
          region: rawRegion as Region,
        },
      });
    })
  );

  const serviceTypeResult = await Promise.all(
    mover.serviceTypes.map((serviceType) => {
      return prisma.moverServiceType.create({
        data: { moverId: result.id, serviceType: serviceType as ServiceType },
      });
    })
  );

  return {
    ...result,
    moverRegions: regionResult.map((region) => region.region),
    moverServiceTypes: serviceTypeResult.map(
      (serviceType) => serviceType.serviceType
    ),
  };
}

export async function update(id: number, data: Prisma.MoverUpdateInput) {
  return prisma.mover.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateLastLoginAt(id: number) {
  return prisma.mover.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export async function getList(filters: MoverListFilters = {}) {
  const {
    regions,
    serviceTypes,
    searchText,
    sortBy = "reviews",
    sortOrder = "desc",
  } = filters;

  // 기본 where 조건
  const whereClause: Prisma.MoverWhereInput = {
    isActive: true,
    deleted: false,
  };

  // 지역 필터 추가
  if (regions && regions.length > 0) {
    whereClause.moverRegions = {
      some: {
        region: {
          in: regions,
        },
      },
    };
  }

  // 서비스 타입 필터 추가
  if (serviceTypes && serviceTypes.length > 0) {
    whereClause.moverServiceTypes = {
      some: {
        serviceType: {
          in: serviceTypes,
        },
      },
    };
  }

  // 검색어 필터 추가 (닉네임, 소개, 설명에서 검색)
  if (searchText) {
    whereClause.OR = [
      { nickname: { contains: searchText, mode: "insensitive" } },
      { introduction: { contains: searchText, mode: "insensitive" } },
      { description: { contains: searchText, mode: "insensitive" } },
    ];
  }

  // 정렬 옵션 설정
  let orderBy: Prisma.MoverOrderByWithRelationInput = {};

  switch (sortBy) {
    case "reviews":
      orderBy = { totalReviews: sortOrder };
      break;
    case "rating":
      orderBy = { averageRating: sortOrder };
      break;
    case "career":
      orderBy = { career: sortOrder };
      break;
    case "quotes":
      orderBy = {
        quotes: {
          _count: sortOrder,
        },
      };
      break;
    default:
      orderBy = { totalReviews: "desc" };
  }

  const raw = await prisma.mover.findMany({
    where: whereClause,
    select: {
      id: true,
      img: true,
      nickname: true,
      career: true,
      introduction: true,
      description: true,
      averageRating: true,
      totalReviews: true,
      moverRegions: { select: { region: true } },
      moverServiceTypes: { select: { serviceType: true } },
      _count: {
        select: {
          reviews: true,
          quotes: { where: { status: "ACCEPTED" } },
          likes: true,
        },
      },
    },
    orderBy,
  });

  return raw;
}

export default {
  findById,
  findByEmail,
  findByNickname,
  findSafeById,
  create,
  update,
  updateLastLoginAt,
  getList,
};
