// src/repositories/booking.repository.ts
import { prisma } from "../lib/prisma";
import { BookingStatus, QuoteType } from "@prisma/client";

export type CreateBookingParams = {
  moveRequestId: number;
  quoteId: number;
  customerId: number;
  moverId: number;
  type: QuoteType;
  priceSnapshot: number;
  serviceDate: Date;
  status?: BookingStatus; // 기본 SCHEDULED
};

const create = async (params: CreateBookingParams) => {
  const {
    moveRequestId,
    quoteId,
    customerId,
    moverId,
    type,
    priceSnapshot,
    serviceDate,
    status = BookingStatus.SCHEDULED,
  } = params;

  return prisma.booking.create({
    data: {
      moveRequestId,
      quoteId,
      customerId,
      moverId,
      type,
      priceSnapshot,
      status,
      serviceDate,
    },
    select: { id: true },
  });
};

export default { create };
