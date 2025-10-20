// src/services/review.service.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/HttpError";
import { createReviewByBookingTx } from "./tx/createReviewByBooking.tx";
import type { CreateReviewBody } from "../schemas/review.schema";
import reviewRepository, {
  FindMyReviewsOpts,
} from "../repositories/review.repository";

const create = async (
  customerId: number,
  bookingId: number,
  payload: CreateReviewBody
) => {
  try {
    return await prisma.$transaction((tx) =>
      createReviewByBookingTx({
        tx,
        bookingId,
        customerId,
        content: payload.content,
        rating: payload.rating,
      })
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // bookingId UNIQUE 충돌
      throw createError("REVIEW/DUPLICATE", { cause: error });
    }
    if ((error as any)?.name === "HttpError") throw error;

    throw createError("SERVER/INTERNAL", {
      messageOverride: "리뷰 생성 중 오류가 발생했습니다.",
      cause: error,
    });
  }
};

const listMyReviews = async (customerId: number, opts: FindMyReviewsOpts) => {
  try {
    return await reviewRepository.findByCustomer(customerId, opts);
  } catch (error) {
    throw createError("SERVER/INTERNAL", {
      messageOverride: "리뷰 목록 조회 중 오류가 발생했습니다.",
      cause: error,
    });
  }
};
export default { create, listMyReviews };
