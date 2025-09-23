import { prisma } from "../lib/prisma";
import { QuoteStatus, QuoteType } from "@prisma/client";

export type CreateQuoteParams = {
  price: number;
  comment: string;
  moveRequestId: number;
  moverId: number;
  type: QuoteType;
};

export const createQuote = async (params: CreateQuoteParams) => {
  const { price, comment, moveRequestId, moverId, type } = params;
  return prisma.quote.create({
    data: {
      price,
      comment,
      moveRequestId,
      moverId,
      type,
      status: QuoteStatus.pending,
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
