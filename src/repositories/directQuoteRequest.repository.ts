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
  create,
  update,
  createRejectedRequest,
};
