import { prisma } from "../lib/prisma";
import { QuoteStatus, QuoteType } from "@prisma/client";

export type CreateQuoteParams = {
  price: number;
  comment: string;
  moveRequestId: number;
  moverId: number;
  type: QuoteType;
};

const create = async (params: CreateQuoteParams) => {
  const { price, comment, moveRequestId, moverId, type } = params;
  return prisma.quote.create({
    data: {
      price,
      comment,
      moveRequestId,
      moverId,
      type,
      status: QuoteStatus.PENDING,
    },
    select: {
      id: true,
      price: true,
      comment: true,
      status: true,
      type: true,
      moveRequestId: true,
      moverId: true,
      createdAt: true,
    },
  });
};

const getById = async (id: number) => {
  const result = await prisma.quote.findUnique({
    where: { id },
    include: { moveRequest: { select: { customerId: true } } },
  });
  return result;
};

const getListByRequest = async (moveRequestId: number) => {
  const result = await prisma.quote.findMany({
    where: { moveRequestId },
  });
  return result;
};

const updateToAccepted = async (id: number) => {
  const result = await prisma.quote.update({
    where: { id },
    data: { status: "ACCEPTED" },
  });
  return result;
};

const updateAllToRejected = async (moveRequestId: number) => {
  const result = await prisma.quote.updateMany({
    where: {
      moveRequestId,
      status: "PENDING",
      moveRequest: { status: "COMPLETED" },
    },
    data: { status: "REJECTED" },
  });
  return result;
};

export default {
  create,
  getById,
  getListByRequest,
  updateToAccepted,
  updateAllToRejected,
};
