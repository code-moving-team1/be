// src/repositories/booking.repository.ts
import { prisma } from "../lib/prisma";
import { BookingStatus, QuoteType, Prisma } from "@prisma/client";

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

export type FindReviewablesOpts = { page: number; pageSize: number };

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

const findReviewablesByCustomer = async (
  customerId: number,
  { page, pageSize }: FindReviewablesOpts
) => {
  const where: Prisma.BookingWhereInput = {
    customerId,
    status: BookingStatus.COMPLETED,
    reviews: null, // ★ 아직 리뷰가 없는 건만
  };

  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { serviceDate: "desc" }, // 최신 이사일 우선
      skip,
      take: pageSize,
      select: {
        id: true,
        serviceDate: true,
        status: true,
        priceSnapshot: true,
        type: true,
        moveRequestId: true,
        moverId: true,
        customerId: true,
        // 카드 렌더용 최소 정보
        mover: {
          select: {
            id: true,
            nickname: true,
            averageRating: true,
            totalReviews: true,
            img: true,
          },
        },
        moveRequest: {
          select: {
            departure: true,
            destination: true,
            serviceType: true,
          },
        },
        quote: {
          select: {
            id: true,
            comment: true,
            price: true,
          },
        },
      },
    }),
  ]);

  // 응답 모양(프론트 친화)
  return {
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    data: rows.map((b) => ({
      bookingId: b.id,
      serviceDate: b.serviceDate,
      status: b.status, // COMPLETED
      price: b.priceSnapshot ?? b.quote?.price ?? null,
      type: b.type, // NORMAL | DIRECT
      mover: b.mover,
      move: {
        from: b.moveRequest?.departure,
        to: b.moveRequest?.destination,
        serviceType: b.moveRequest?.serviceType,
      },
      reviewable: true, // 명시
    })),
  };
};

// ✅ serviceDate가 기준 시각(before)보다 과거인 SCHEDULED를 COMPLETED로 전환
const completeOverdue = async (before: Date) => {
  return prisma.booking.updateMany({
    where: {
      status: BookingStatus.SCHEDULED,
      serviceDate: { lt: before },
    },
    data: {
      status: BookingStatus.COMPLETED,
      updatedAt: new Date(),
    },
  }); // { count }
};

export default { create, findReviewablesByCustomer, completeOverdue };
