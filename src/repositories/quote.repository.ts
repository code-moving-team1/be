// src/repositories/quote.repository.ts
import { prisma } from "../lib/prisma";
import { QuoteStatus, QuoteType, Prisma } from "@prisma/client";

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
    include: { moveRequest: { select: { customerId: true, status: true } } },
  });
  return result;
};

const getListByRequest = async (moveRequestId: number) => {
  const result = await prisma.quote.findMany({
    where: { moveRequestId },
    select: {
      id: true,
      price: true,
      comment: true,
      status: true,
      type: true,
      moverId: true,
      createdAt: true,
      moveRequest: { select: { serviceType: true } },
      mover: {
        select: {
          id: true,
          nickname: true,
          career: true,
          averageRating: true,
          totalReviews: true,
          img: true,
          _count: { select: { likes: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
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

// Booking 생성에 필요한 스냅샷 필드 모음
const getSnapshotForBooking = async (quoteId: number) => {
  return prisma.quote.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      status: true,
      type: true,
      price: true,
      moverId: true,
      moveRequestId: true,
      moveRequest: {
        select: {
          id: true,
          customerId: true,
          status: true,
          moveDate: true,
        },
      },
    },
  });
};

// 견적 상세 페이지
export const getQuoteById = async (id: number) => {
  return prisma.quote.findUnique({
    where: { id },
    select: {
      id: true,
      price: true,
      comment: true,
      status: true,
      type: true,
      createdAt: true,
      moverId: true,
      moveRequestId: true,
      mover: {
        select: {
          id: true,
          nickname: true,
          career: true,
          averageRating: true,
          totalReviews: true,
          img: true,
          _count: { select: { likes: true } },
        },
      },
      moveRequest: {
        select: {
          id: true,
          serviceType: true,
          moveDate: true,
          departure: true,
          departureRegion: true,
          destination: true,
          destinationRegion: true,
          status: true,
          customerId: true,
          createdAt: true,
        },
      },
    },
  });
};

export const getMyQuoteDetail = async (quoteId: number, moverId: number) => {
  const q = await prisma.quote.findFirst({
    where: { id: quoteId, moverId },
    include: {
      // moveRequest: true,
      moveRequest: {
        include: { customer: { select: { name: true } } },
      },
    },
  });
  if (!q) return null;

  return {
    id: q.id,
    price: q.price,
    status: q.status,
    type: q.type,
    comment: q.comment,
    createdAt: q.createdAt,
    moveRequest: {
      id: q.moveRequest.id,
      departure: q.moveRequest.departure,
      destination: q.moveRequest.destination,
      moveDate: q.moveRequest.moveDate as any,
      serviceType: q.moveRequest.serviceType as any,
      status: q.moveRequest.status as any,
      customerName: q.moveRequest.customer?.name ?? null,
    },
  };
};

export default {
  create,
  getById,
  getListByRequest,
  updateToAccepted,
  updateAllToRejected,
  getSnapshotForBooking,
  getQuoteById,
  getMyQuoteDetail,
};
