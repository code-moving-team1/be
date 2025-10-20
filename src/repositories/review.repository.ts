// src/repositories/review.repository.ts
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export type FindMyReviewsOpts = {
  page?: number;
  pageSize?: number;
  sort?: "recent" | "oldest" | "rating_desc" | "rating_asc";
};

const findByCustomer = async (
  customerId: number,
  { page = 1, pageSize = 10, sort = "recent" }: FindMyReviewsOpts
) => {
  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "rating_desc"
      ? { rating: "desc" }
      : sort === "rating_asc"
      ? { rating: "asc" }
      : { createdAt: "desc" }; // default recent

  const where: Prisma.ReviewWhereInput = { customerId };

  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        // 연결 정보 (카드용)
        mover: {
          select: {
            id: true,
            nickname: true,
            img: true,
            averageRating: true,
            totalReviews: true,
          },
        },
        booking: {
          select: {
            id: true,
            serviceDate: true,
            type: true,
            priceSnapshot: true,
          },
        },
        moveRequest: {
          select: {
            id: true,
            departure: true,
            destination: true,
            serviceType: true,
            moveDate: true,
          },
        },
      },
    }),
  ]);

  return {
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    data: rows.map((r) => ({
      reviewId: r.id,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      // createdAt: r.createdAt.toISOString(),
      // updatedAt: r.updatedAt.toISOString(),
      mover: r.mover
        ? {
            id: r.mover.id,
            nickname: r.mover.nickname,
            img: r.mover.img,
            averageRating: r.mover.averageRating,
            totalReviews: r.mover.totalReviews,
          }
        : null,
      booking: r.booking
        ? {
            id: r.booking.id,
            serviceDate: r.booking.serviceDate,
            type: r.booking.type,
            price: r.booking.priceSnapshot,
          }
        : null,
      move: r.moveRequest
        ? {
            id: r.moveRequest.id,
            from: r.moveRequest.departure,
            to: r.moveRequest.destination,
            serviceType: r.moveRequest.serviceType,
            moveDate: r.moveRequest.moveDate,
          }
        : null,
    })),
  };
};

export default { findByCustomer };
