// src/repositories/moveRequest.repository.ts
import { MoveRequestStatus, ServiceType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  CreateMoveRequestInput,
  SearchMoveRequestsInput,
} from "../schemas/moveRequest.schema";

// 이사 요청 생성
const createMoveRequest = async (
  customerId: number,
  data: CreateMoveRequestInput
) => {
  return prisma.moveRequest.create({
    data: {
      ...data,
      customerId,
    },
  });
};

// 기사 유저 견적 작성용
export const getMoveRequestById = async (id: number) => {
  return prisma.moveRequest.findUnique({
    where: { id },
  });
};

export const searchMoveRequests = async (
  filters: SearchMoveRequestsInput,
  moverId?: number
) => {
  const { page, pageSize, sort } = filters;
  const where = buildMoveRequestWhere(filters);

  // ✅ 옵션으로만 동작: 내가 낸 건(노멀 견적)은 상태와 무관하게 포함
  // if (includeMyHistory && moverId) {
  //   // where.status는 이미 ACTIVE로 세팅되어 있음 → OR 로 추가
  //   (where as any).OR = [
  //     { status: "ACTIVE" },
  //     { quotes: { some: { moverId, type: "NORMAL" } } },
  //   ];
  // }

  //전체 개수(페이지네이션 용)
  const [total, data] = await Promise.all([
    //total - 전체 개수 - 페이지네이션용
    prisma.moveRequest.count({ where }),
    //data - 리스트 내용
    prisma.moveRequest.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: sort ? { [sort.field]: sort.order } : { createdAt: "desc" },
      // ...(moverId && {
      //   include: {
      //     quotes: {
      //       where: { moverId },
      //       take: 1,
      //     },
      //   },
      // }),

      // include:moverId
      // ?{
      //   quotes:{
      //     where:{moverId},
      //     take:1, //본인 견적만 하나
      //   },
      // }
      // :null,

      //moverId 가 있으면 해당 무버가 낸 견적 1개만 가져옴
      // - moverId가 없으면 → 모든 견적(quotes)을 포함시킴
      include: {
        quotes: moverId
          ? {
              // where: { moverId, type: "NORMAL" },
              where: { moverId },
              select: {
                id: true,
                price: true,
                comment: true,
                status: true,
                type: true,
              },
              take: 1,
            }
          : true,
        // :false, // 토큰없으면 quotes 안들고옴
        customer: {
          select: { name: true },
        },
      },
    }),
  ]);

  const result = data.map((r) => {
    const quotes = (r as any).quotes as
      | Array<{
          id: number;
          price: number;
          comment: string;
          status: any;
          type: any;
        }>
      | undefined;
    return {
      ...r,
      moveRequest: quotes && quotes[0] ? quotes[0] : null, // 예원 태홍 사용

      // ✅ myQuote 필드 추가
      // - 무버 로그인 상태라면: 해당 무버의 견적 1개만 매핑
      // - 무버가 아닌 경우: 항상 null
      // 이렇게 하면 프론트에서는 quotes 배열 대신 myQuote만 확인하면 됨
      myQuote: moverId ? r.quotes?.[0] ?? null : null, //성근님 사용
      customerName: r.customer?.name ?? null,
    };
  });

  return {
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    data: result,
  };
};

function buildMoveRequestWhere(
  filters: SearchMoveRequestsInput
): Prisma.MoveRequestWhereInput {
  const {
    regions,
    departureRegions,
    destinationRegions,
    serviceTypes,
    status,
    dateFrom,
    dateTo,
  } = filters;

  const where: Prisma.MoveRequestWhereInput = {};

  if (regions && regions.length > 0) {
    where.OR = [
      { departureRegion: { in: regions } },
      { destinationRegion: { in: regions } },
    ];
  }

  if (departureRegions && departureRegions.length > 0) {
    where.departureRegion = { in: departureRegions };
  }

  if (destinationRegions && destinationRegions.length > 0) {
    where.destinationRegion = { in: destinationRegions };
  }

  if (serviceTypes && serviceTypes.length > 0) {
    where.serviceType = { in: serviceTypes };
  }

  // ✅ 기본값: status 미지정 시 ACTIVE만
  if (!status || status.length === 0) {
    where.status = "ACTIVE";
  } else {
    where.status = { in: status };
  }

  // if (status && status.length > 0) {
  //   where.status = { in: status }; // status : ACTIVE로 req가 와야 적용됨
  // }

  if (dateFrom || dateTo) {
    where.moveDate = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  return where;
}

const getListByCustomer = async (customerId: number, isActive = true) => {
  const where: Prisma.MoveRequestWhereInput = isActive
    ? { customerId, status: MoveRequestStatus.ACTIVE }
    : {
        customerId,
        status: {
          in: [MoveRequestStatus.COMPLETED, MoveRequestStatus.FINISHED],
        },
      };

  return prisma.moveRequest.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
};

// const getListByCustomer = async (customerId: number, isActive = true) => {
//   const moveStatus = isActive
//     ? MoveRequestStatus.ACTIVE
//     : MoveRequestStatus.FINISHED || MoveRequestStatus.COMPLETED;
//   const result = await prisma.moveRequest.findMany({
//     where: { customerId, status: moveStatus },
//     orderBy: { createdAt: "asc" },
//   });

//   return result;
// };

const updateToCompleted = async (id: number) => {
  const result = await prisma.moveRequest.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
  return result;
};

const getListByCustomerWhenDirect = async (
  customerId: number,
  moverId: number,
  page = 1
) => {
  const total = await prisma.moveRequest.count({
    where: { customerId, status: "ACTIVE" },
  });

  const raw = await prisma.moveRequest.findMany({
    where: { customerId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    include: { directQuoteRequests: { where: { moverId } } },
    take: 5,
    skip: (page - 1) * 5,
  });

  const result = raw.map((row) => {
    const { directQuoteRequests, ...rest } = row;
    if (directQuoteRequests.length === 0) {
      return { ...rest, isDirectAlready: false };
    } else if (directQuoteRequests.length === 1) {
      return { ...rest, isDirectAlready: true };
    } else {
      //TODO 에러처리 필요
      return;
    }
  });

  return {
    data: result,
    meta: { page, pageSize: 5, total, totalPages: Math.ceil(total / 5) },
  };
};

export const getDirectList = async (
  moverId: number,
  sort = "move-date",
  page = 1,
  pageSize = 4
) => {
  const offset = (page - 1) * pageSize;
  const order =
    sort === "requested" ? `dr."createdAt" ASC` : `mr."moveDate" ASC`;

  // 전체 개수 조회
  const totalResult = await prisma.$queryRawUnsafe(
    `
      SELECT COUNT(*) as total
      FROM "MoveRequest" mr
      INNER JOIN "DirectQuoteRequest" dr ON mr.id = dr."moveRequestId"
      WHERE dr."moverId" = ${moverId}
      AND dr.status = 'PENDING'
      `
  );
  const total = Number((totalResult as any)[0].total);

  const data = await prisma.$queryRawUnsafe(
    `
    SELECT 
      mr.*,
      c.name as customer_name,
      c.email as customer_email,
      c.phone as customer_phone,
      c.region as customer_region,
      dr.id as direct_request_id,
      dr.status as direct_request_status,
      dr."createdAt" as direct_request_created_at
    FROM "MoveRequest" mr
    INNER JOIN "DirectQuoteRequest" dr ON mr.id = dr."moveRequestId"
    LEFT JOIN "Customer" c ON mr."customerId" = c.id
    WHERE dr."moverId" = ${moverId}
    AND dr.status = 'PENDING'
    ORDER BY ${order}
    LIMIT ${pageSize} OFFSET ${offset}
    `
  );

  return {
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    data,
  };
};

export const searchSentEstimatesMoveRequests = async (
  filters: SearchMoveRequestsInput,
  moverId?: number
) => {
  const { page, pageSize, sort } = filters;
  const where = buildMoveRequestSentEstimatesWhere(filters);
  const [total, data] = await Promise.all([
    prisma.moveRequest.count({ where }),

    prisma.moveRequest.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: sort ? { [sort.field]: sort.order } : { createdAt: "desc" },

      include: {
        quotes: moverId
          ? {
              where: { moverId },
              take: 1,
            }
          : true,
        customer: { select: { name: true } },
      },
    }),
  ]);
  const result = data.map((r) => ({
    ...r,
    // ✅ myQuote 필드 추가
    // - 무버 로그인 상태라면: 해당 무버의 견적 1개만 매핑
    // - 무버가 아닌 경우: 항상 null
    // 이렇게 하면 프론트에서는 quotes 배열 대신 myQuote만 확인하면 됨
    myQuote: moverId ? r.quotes?.[0] ?? null : null,
    customerName: r.customer?.name ?? null,
  }));

  return {
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    data: result,
  };
};

function buildMoveRequestSentEstimatesWhere(
  filters: SearchMoveRequestsInput
): Prisma.MoveRequestWhereInput {
  const {
    regions,
    departureRegions,
    destinationRegions,
    serviceTypes,
    status,
    dateFrom,
    dateTo,
  } = filters;

  const where: Prisma.MoveRequestWhereInput = {};

  if (regions && regions.length > 0) {
    where.OR = [
      { departureRegion: { in: regions } },
      { destinationRegion: { in: regions } },
    ];
  }

  if (departureRegions && departureRegions.length > 0) {
    where.departureRegion = { in: departureRegions };
  }

  if (destinationRegions && destinationRegions.length > 0) {
    where.destinationRegion = { in: destinationRegions };
  }

  if (serviceTypes && serviceTypes.length > 0) {
    where.serviceType = { in: serviceTypes };
  }

  if (status && status.length > 0) {
    where.status = { in: status }; // status : ACTIVE로 req가 와야 적용됨
  }

  if (dateFrom || dateTo) {
    where.moveDate = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  return where;
}

export default {
  createMoveRequest,
  getMoveRequestById,
  searchMoveRequests,
  getListByCustomer,
  updateToCompleted,
  getListByCustomerWhenDirect,
  getDirectList,
  searchSentEstimatesMoveRequests,
};
