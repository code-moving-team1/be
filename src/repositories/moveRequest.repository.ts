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
              where: { moverId },
              take: 1,
            }
          : true,
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
  }));

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

const getListByCustomer = async (customerId: number, isActive = true) => {
  const moveStatus = isActive
    ? MoveRequestStatus.ACTIVE
    : MoveRequestStatus.FINISHED || MoveRequestStatus.COMPLETED;
  const result = await prisma.moveRequest.findMany({
    where: { customerId, status: moveStatus },
    orderBy: { createdAt: "asc" },
  });

  return result;
};

const updateToCompleted = async (id: number) => {
  const result = await prisma.moveRequest.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
  return result;
};

const getListByCustomerWhenDirect = async (customerId: number, page = 1) => {
  const raw = await prisma.moveRequest.findMany({
    where: { customerId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    include: { directQuoteRequests: true },
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

  return result;
};

export default {
  createMoveRequest,
  getMoveRequestById,
  searchMoveRequests,
  getListByCustomer,
  updateToCompleted,
  getListByCustomerWhenDirect,
};
