import { prisma } from "../lib/prisma";
import { Region, ServiceType, UserPlatform, type Prisma } from "@prisma/client";
import { createError } from "../utils/HttpError";

// 정렬 옵션 타입 정의
export type SortOption = "reviews" | "rating" | "career" | "quotes";

export type MoverListFilters = {
  region?: Region;
  serviceType?: ServiceType;
  searchText?: string;
  sortBy?: SortOption;
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
    `WHERE m."isActive" = true AND m.deleted = false` + searchConditions;

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
    WHERE m."isActive" = true AND m.deleted = false
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
      reviews: true,
      _count: {
        select: {
          likes: true,
          reviews: true,
          quotes: { where: { status: "ACCEPTED" } },
        },
      },
    },
  });

  const { password, naverId, googleId, kakaoId, ...rest } = result;
  return rest;
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
  getLikesList,
  getProfile,
};
