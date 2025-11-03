import { prisma } from "../lib/prisma";
import { Region, ServiceType, UserPlatform, type Prisma } from "@prisma/client";
import { createError } from "../utils/HttpError";
import { Rating } from "../types/rating";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
// 정렬 옵션 타입 정의
export type SortOption = "reviews" | "rating" | "career" | "quotes";

export type MoverListFilters = {
  region?: Region;
  serviceType?: ServiceType;
  searchText?: string;
  sortBy?: SortOption;
};

export type MoverInitProfile = {
  id: number;
  nickname: string;
  career: string;
  introduction: string;
  description: string;
  regions: Region[];
  serviceTypes: ServiceType[];
  img?: string;
};

export type MoverProfileUpdate = {
  id: number;
  nickname?: string;
  career?: string;
  introduction?: string;
  description?: string;
  regions?: Region[];
  serviceTypes?: ServiceType[];
  img?: string;
};

export type MoverBasicInfoUpdate = {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
};

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
  name: string;
  userPlatform?: UserPlatform;
  platformId?: string;
  img?: string;
}) {
  const platform =
    mover.userPlatform === "GOOGLE" && mover.platformId
      ? { userPlatform: mover.userPlatform, googleId: mover.platformId }
      : mover.userPlatform === "NAVER" && mover.platformId
      ? { userPlatform: mover.userPlatform, naverId: mover.platformId }
      : mover.userPlatform === "KAKAO" && mover.platformId
      ? { userPlatform: mover.userPlatform, kakaoId: mover.platformId }
      : {};
  const result = await prisma.mover.create({
    data: {
      name: mover.name,
      email: mover.email,
      password: mover.password,
      phone: mover.phone,
      ...platform,
      ...(mover.img !== undefined ? { img: mover.img } : {}),
    },
  });

  return result;
}

export async function updateInitProfile(data: MoverInitProfile) {
  console.log(data);
  const {
    id,
    nickname,
    career,
    introduction,
    description,
    regions,
    serviceTypes,
    img,
  } = data;

  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.mover.update({
      where: {
        id,
      },
      data: {
        nickname,
        career,
        introduction,
        description,
        hasProfile: true,
        ...(img ? { img } : {}),
      },
    });
    const serviceTypeResult = await Promise.all(
      serviceTypes.map((serviceType) => {
        return tx.moverServiceType.create({
          data: {
            moverId: result.id,
            serviceType,
          },
        });
      })
    );
    const regionResult = await Promise.all(
      regions.map((region) => {
        return tx.moverRegion.create({
          data: {
            moverId: result.id,
            region,
          },
        });
      })
    );

    return result;
  });

  return result;
}

export async function updateBasicInfo(data: MoverBasicInfoUpdate) {
  const { id, name, email, phone, currentPassword, newPassword } = data;

  const result = await prisma.$transaction(async (tx) => {
    const mover = await tx.mover.findUnique({
      where: { id },
      select: { password: true, email: true },
    });

    if (!mover) {
      throw createError("USER/NOT_FOUND");
    }

    // 이메일 변경이 있는 경우
    if (email !== mover.email) {
      try {
        await tx.mover.update({
          where: { id },
          data: { email: email },
        });
      } catch (e) {
        throw createError("AUTH/DUPLICATE", {
          messageOverride: "이미 사용 중인 이메일입니다.",
        });
      }
    }

    // 비밀번호 변경이 있는 경우
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        mover.password
      );
      if (!isPasswordValid) {
        throw createError("AUTH/PASSWORD", {
          messageOverride: "현재 비밀번호가 올바르지 않습니다.",
        });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await tx.mover.update({
        where: { id },
        data: { password: hashedNewPassword },
      });
    }

    const updatedMover = await tx.mover.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
      },
    });

    return updatedMover;
  });

  return result;
}

export async function updateProfile(data: MoverProfileUpdate) {
  const {
    id,
    nickname,
    career,
    introduction,
    description,
    regions,
    serviceTypes,
    img,
  } = data;

  const result = await prisma.$transaction(async (tx) => {
    // 기본 정보 업데이트
    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (career !== undefined) updateData.career = career;
    if (introduction !== undefined) updateData.introduction = introduction;
    if (description !== undefined) updateData.description = description;
    if (img !== undefined) updateData.img = img;

    const mover = await tx.mover.update({
      where: { id },
      data: updateData,
      include: {
        moverRegions: { select: { region: true } },
        moverServiceTypes: { select: { serviceType: true } },
      },
    });

    // 지역 정보 업데이트 (있는 경우)
    if (regions !== undefined) {
      const existingRegions = mover.moverRegions.map((mr) => mr.region);
      const regionsToAdd = regions.filter(
        (region) => !existingRegions.includes(region)
      );
      const regionsToRemove = existingRegions.filter(
        (region) => !regions.includes(region)
      );

      // 삭제할 지역들만 삭제
      if (regionsToRemove.length > 0) {
        await tx.moverRegion.deleteMany({
          where: {
            moverId: id,
            region: { in: regionsToRemove },
          },
        });
      }

      // 추가할 지역들만 추가
      if (regionsToAdd.length > 0) {
        await Promise.all(
          regionsToAdd.map((region) => {
            return tx.moverRegion.create({
              data: {
                moverId: id,
                region,
              },
            });
          })
        );
      }
    }

    // 서비스 타입 정보 업데이트 (있는 경우)
    if (serviceTypes !== undefined) {
      const existingServiceTypes = mover.moverServiceTypes.map(
        (mst) => mst.serviceType
      );
      const serviceTypesToAdd = serviceTypes.filter(
        (serviceType) => !existingServiceTypes.includes(serviceType)
      );
      const serviceTypesToRemove = existingServiceTypes.filter(
        (serviceType) => !serviceTypes.includes(serviceType)
      );

      // 삭제할 서비스 타입들만 삭제
      if (serviceTypesToRemove.length > 0) {
        await tx.moverServiceType.deleteMany({
          where: {
            moverId: id,
            serviceType: { in: serviceTypesToRemove },
          },
        });
      }

      // 추가할 서비스 타입들만 추가
      if (serviceTypesToAdd.length > 0) {
        await Promise.all(
          serviceTypesToAdd.map((serviceType) => {
            return tx.moverServiceType.create({
              data: {
                moverId: id,
                serviceType,
              },
            });
          })
        );
      }
    }

    return mover;
  });

  return result;
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

export async function getList({
  region,
  serviceType,
  searchText = "",
  sortBy = "reviews",
}: MoverListFilters) {
  // WHERE절 생성
  const searchConditions = searchText
    ? ` AND (m.nickname ILIKE '%${searchText}%' OR m.introduction ILIKE '%${searchText}%' OR m.description ILIKE '%${searchText}%')`
    : "";
  const whereClause =
    `WHERE m."hasProfile" = true AND m."isActive" = true AND m.deleted = false` +
    searchConditions;

  // 그룹화 후 필터 (HAVING 절에서 처리)
  let havingConditions: string[] = [];
  region &&
    havingConditions.push(`'${region}' = ANY(ARRAY_AGG(DISTINCT mr.region))`);
  serviceType &&
    havingConditions.push(
      `'${serviceType}' = ANY(ARRAY_AGG(DISTINCT mst."serviceType"))`
    );

  const havingClause =
    havingConditions.length > 0
      ? "HAVING " + havingConditions.join(" AND ")
      : "";

  // 정렬 조건
  function orderBySql(sortBy: string) {
    switch (sortBy) {
      case "reviews":
        return `ORDER BY (
        SELECT COUNT(*)
        FROM "Review" r 
        WHERE r."moverId" = m.id
      ) DESC`;
      case "rating":
        return 'ORDER BY m."averageRating" DESC';
      case "career":
        return "ORDER BY m.career DESC";
      case "quotes":
        return `ORDER BY (
        SELECT COUNT(*) 
        FROM "Quote" q 
        WHERE q."moverId" = m.id AND q.status = 'ACCEPTED'
      ) DESC`;
      default:
        return createError("REQUEST/VALIDATION");
    }
  }

  const orderBy = orderBySql(sortBy);

  const query = `
    SELECT 
      m.id,
      m.img,
      m.nickname,
      m.career,
      m.introduction,
      m.description,
      m."averageRating",
      ARRAY_AGG(DISTINCT mr.region) FILTER (WHERE mr.region IS NOT NULL) as regions,
      ARRAY_AGG(DISTINCT mst."serviceType") FILTER (WHERE mst."serviceType" IS NOT NULL) as service_types,
      (
        SELECT COUNT(*) 
        FROM "Quote" q 
        WHERE q."moverId" = m.id AND q.status = 'ACCEPTED'
      ) as accepted_quotes_count,
      (
        SELECT COUNT(*) 
        FROM "Review" r 
        WHERE r."moverId" = m.id
      ) as reviews_count,
      (
        SELECT COUNT(*) 
        FROM "Likes" l 
        WHERE l."moverId" = m.id
      ) as likes_count
    FROM "Mover" m
    LEFT JOIN "MoverRegion" mr ON mr."moverId" = m.id
    LEFT JOIN "MoverServiceType" mst ON mst."moverId" = m.id
    ${whereClause}
    GROUP BY m.id
    ${havingClause}
    ${orderBy}
  `;

  const raw: any[] = await prisma.$queryRawUnsafe(query);
  const result = raw.map((mover: any) => {
    const {
      reviews_count,
      accepted_quotes_count,
      likes_count,
      regions,
      service_types,
      ...rest
    } = mover;
    return {
      ...rest,
      moverRegions: regions || [],
      moverServiceTypes: service_types || [],
      _count: {
        reviews: Number(mover.reviews_count),
        quotes: Number(mover.accepted_quotes_count),
        likes: Number(mover.likes_count),
      },
    };
  });

  return result;
}

export async function getLikesList(customerId: number) {
  const query = `
    SELECT 
      m.id,
      m.img,
      m.nickname,
      m.career,
      m.introduction,
      m.description,
      m."averageRating",
      ARRAY_AGG(DISTINCT mr.region) FILTER (WHERE mr.region IS NOT NULL) as regions,
      ARRAY_AGG(DISTINCT mst."serviceType") FILTER (WHERE mst."serviceType" IS NOT NULL) as service_types,
      (
        SELECT COUNT(*) 
        FROM "Quote" q 
        WHERE q."moverId" = m.id AND q.status = 'ACCEPTED'
      ) as accepted_quotes_count,
      (
        SELECT COUNT(*) 
        FROM "Review" r 
        WHERE r."moverId" = m.id
      ) as reviews_count,
      (
        SELECT COUNT(*) 
        FROM "Likes" l 
        WHERE l."moverId" = m.id
      ) as likes_count,
      l.createdAt as liked_at
    FROM "Mover" m
    INNER JOIN "Likes" l ON l."moverId" = m.id AND l."customerId" = ${customerId}
    LEFT JOIN "MoverServiceType" mst ON mst."moverId" = m.id
    WHERE m."hasProfile" = true AND m."isActive" = true AND m.deleted = false
    GROUP BY m.id
    ORDER BY l.createdAt DESC
    LIMIT 3
  `;

  const raw: any[] = await prisma.$queryRawUnsafe(query);

  const result = raw.map((mover: any) => {
    const {
      reviews_count,
      accepted_quotes_count,
      likes_count,
      regions,
      service_types,
      liked_at,
      ...rest
    } = mover;
    return {
      ...rest,
      moverRegions: regions || [],
      moverServiceTypes: service_types || [],
      _count: {
        reviews: Number(mover.reviews_count),
        quotes: Number(mover.accepted_quotes_count),
        likes: Number(mover.likes_count),
      },
    };
  });

  return result;
}

export async function getProfile(id: number) {
  const result = await prisma.mover.findUnique({
    where: { id, deleted: false },
    include: {
      moverRegions: true,
      moverServiceTypes: true,
      _count: {
        select: {
          likes: true,
          bookings: true,
        },
      },
    },
  });

  if (!result) {
    throw createError("USER/NOT_FOUND");
  }

  const { password, naverId, googleId, kakaoId, ...rest } = result;

  return rest;
}

export default {
  findById,
  findByEmail,
  findByNickname,
  findSafeById,
  create,
  updateInitProfile,
  updateProfile,
  updateBasicInfo,
  update,
  updateLastLoginAt,
  getList,
  getLikesList,
  getProfile,
};
