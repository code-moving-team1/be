// src/services/review.service.ts
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/HttpError";
import { createReviewByBookingTx } from "./tx/createReviewByBooking.tx";
import type { CreateReviewBody } from "../schemas/review.schema";
import reviewRepository, {
  FindMyReviewsOpts,
} from "../repositories/review.repository";
import { notifyMover } from "./notification.service";
import { notificationLink } from "../constants/notification.links";

const create = async (
  customerId: number,
  bookingId: number,
  payload: CreateReviewBody
) => {
  try {
    const result = await prisma.$transaction((tx) =>
      createReviewByBookingTx({
        tx,
        bookingId,
        customerId,
        content: payload.content,
        rating: payload.rating,
      })
    );
    await notifyMover(result.moverId, {
      type: "REVIEW_RECEIVED",
      content: "고객이 리뷰를 남겼어요.",
      link: notificationLink.reviewReceived(result.moverId),
    });

    return result;
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

const getListByMover = async (moverId: number, page: number) => {
  try {
    return await reviewRepository.getListByMover(moverId, page);
  } catch (error) {
    throw createError("SERVER/INTERNAL", {
      messageOverride: "이사업체별 리뷰 목록 조회 중 오류가 발생했습니다.",
      cause: error,
    });
  }
};

export default { create, listMyReviews, getListByMover };
