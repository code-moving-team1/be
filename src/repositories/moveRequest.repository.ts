// src/repositories/moveRequest.repository.ts
import { MoveRequestStatus, ServiceType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  CreateMoveRequestInput,
  SearchMoveRequestsInput,
} from "../schemas/moveRequest.schema";

export const createMoveRequest = async (
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

interface GetMoveRequestsListParams {
  limit: number;
  page: number;
  serviceType?: ServiceType;
  departureRegion?: string;
  destinationRegion?: string;
  orderBy?: "recent" | "deadline";
}

export const getMoveRequestsList = async ({
  limit = 5,
  page = 1,
  serviceType,
  departureRegion,
  destinationRegion,
  orderBy = "recent",
}: GetMoveRequestsListParams) => {
  const whereConditions: Prisma.MoveRequestWhereInput = {
    status: MoveRequestStatus.ACTIVE,
    ...(serviceType && { serviceType }),
    ...(departureRegion && { departureRegion }),
    ...(destinationRegion && { destinationRegion }),
  };

  const orderByConditions: Prisma.MoveRequestOrderByWithRelationInput =
    orderBy === "deadline" ? { moveDate: "asc" } : { createdAt: "desc" };

  return prisma.moveRequest.findMany({
    where: whereConditions,
    orderBy: orderByConditions,
    take: limit,
    skip: (page - 1) * limit,
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
