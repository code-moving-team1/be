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

export const searchMoveRequests = async (filters: SearchMoveRequestsInput) => {
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
    }),
  ]);

  return {
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    data,
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

export default {
  createMoveRequest,
  searchMoveRequests,
  getListByCustomer,
};
