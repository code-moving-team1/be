// src/repositories/directQuoteRequest.repository.ts
import { prisma } from "../lib/prisma";
import type { DirectRequestStatus, Prisma } from "@prisma/client";
import { createError } from "../utils/HttpError";

const getById = async (id: number) => {
  const result = await prisma.directQuoteRequest.findUnique({
    where: { id },
  });
  return result;
};

const getByMoverAndRequest = async (moverId: number, moveRequestId: number) => {
  const result = await prisma.directQuoteRequest.findUnique({
    where: {
      moveRequestId_moverId: {
        moveRequestId,
        moverId,
      },
    },
  });
  return result;
};

const getListByCustomer = async (customerId: number) => {
  const result = await prisma.directQuoteRequest.findMany({
    where: { moveRequest: { customerId } },
    include: { moveRequest: true },
  });
  return result;
};

const getRejectedListByMover = async (moverId: number) => {
  const rows = await prisma.directQuoteRequest.findMany({
    where: { moverId, status: "REJECTED" },
    include: {
      moveRequest:
        // true,
        {
          include: { customer: { select: { name: true } } },
        },
      rejectedRequest: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // return result;
  // ✅ moveRequest.customer → moveRequest.customerName으로 평탄화
  return rows.map((row) => {
    const { moveRequest, ...rest } = row;
    const { customer, ...mrRest } = moveRequest ?? ({} as any);
    return {
      ...rest,
      moveRequest: {
        ...mrRest,
        customerName: customer?.name ?? null,
      },
    };
  });
};

const create = async (moveRequestId: number, moverId: number) => {
  const result = await prisma.directQuoteRequest.create({
    data: {
      moveRequestId,
      moverId,
    },
  });
  return result;
};

const update = async (id: number, status: DirectRequestStatus) => {
  const result = await prisma.directQuoteRequest.update({
    where: { id },
    data: {
      status,
    },
  });
  return result;
};

// 거절 인스턴스 생성
const createRejectedRequest = async (
  comment: string,
  directRequestId: number
) => {
  const result = await prisma.rejectedRequest.create({
    data: { comment, directRequestId },
  });
  return result;
};

export default {
  getById,
  getByMoverAndRequest,
  getRejectedListByMover,
  create,
  update,
  createRejectedRequest,
  getListByCustomer,
};
