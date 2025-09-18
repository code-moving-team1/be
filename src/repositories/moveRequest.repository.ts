// src/repositories/moveRequest.repository.ts
import { MoveRequestStatus, ServiceType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { CreateMoveRequestInput } from "../schemas/moveRequest.schema";

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
  orderBy?: "recent" | "deadline";
}

export const getMoveRequestsList = async ({
  limit = 5,
  page = 1,
  serviceType,
  orderBy = "recent",
}: GetMoveRequestsListParams) => {
  const whereConditions: Prisma.MoveRequestWhereInput = {
    status: MoveRequestStatus.ACTIVE,
    ...(serviceType && { serviceType }),
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
