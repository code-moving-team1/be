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
            name: true,
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
            name: r.mover.name,
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

const getListByMover = async (moverId: number, page = 1) => {
  const where = { moverId };

  // 레이팅별 카운트 조회
  const ratingGroups = await prisma.review.groupBy({
    by: ["rating"],
    where,
    _count: {
      rating: true,
    },
  });

  // 레이팅별 카운트를 객체로 변환 (1~5점)
  const ratingCounts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  ratingGroups.forEach((group) => {
    ratingCounts[group.rating] = group._count.rating;
  });

  // 리뷰 목록 조회
  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { name: true, id: true } },
    },
    take: 5,
    skip: (page - 1) * 5,
  });

  // 전체 리뷰 개수
  const total = reviews.length;

  return {
    reviews,
    ratingCounts,
    total,
  };
};

export default { findByCustomer, getListByMover };
