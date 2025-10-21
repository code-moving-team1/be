// src/services/tx/createReviewByBooking.tx.ts
import { Prisma, BookingStatus } from "@prisma/client";
import { createError } from "../../utils/HttpError";

type Tx = Prisma.TransactionClient;

type CreateReviewTxArgs = {
  tx: Tx;
  bookingId: number;
  customerId: number;
  content: string;
  rating: number;
};

/**
 * 조건
 * - booking 존재
 * - booking.customerId === customerId (본인만 작성 가능)
 * - booking.status === COMPLETED (완료된 예약만)
 * - 해당 bookingId로 리뷰 미존재(Unique)
 * 효과
 * - Review 생성
 * - Mover 평균/개수 갱신 (원자적)
 */
export async function createReviewByBookingTx({
  tx,
  bookingId,
  customerId,
  content,
  rating,
}: CreateReviewTxArgs): Promise<{
  id: number;
  moverId: number;
  moveRequestId: number;
}> {
  // 1) Booking 조회
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      customerId: true,
      moverId: true,
      moveRequestId: true,
    },
  });
  if (!booking) throw createError("BOOKING/NOT_FOUND");
  if (booking.customerId !== customerId) throw createError("REVIEW/FORBIDDEN");
  if (booking.status !== BookingStatus.COMPLETED) {
    throw createError("BOOKING/NOT_COMPLETED");
  }

  // 2) 중복 리뷰 여부(사전 확인) — bookingId UNIQUE이므로 사전 가드 + P2002 이중 방어
  const exists = await tx.review.findUnique({
    where: { bookingId: bookingId },
    select: { id: true },
  });
  if (exists) throw createError("REVIEW/DUPLICATE");

  // 3) 리뷰 생성
  const review = await tx.review.create({
    data: {
      bookingId: booking.id,
      content,
      rating,
      customerId: booking.customerId,
      moverId: booking.moverId,
      moveRequestId: booking.moveRequestId,
    },
    select: { id: true, rating: true, moverId: true },
  });

  // 4) 기사 평점/리뷰수 갱신(달리 설계 없다면 누적 방식이 경량)
  const mover = await tx.mover.findUnique({
    where: { id: review.moverId },
    select: { averageRating: true, totalReviews: true },
  });
  const total = (mover?.totalReviews ?? 0) + 1;
  const avg =
    total === 0
      ? review.rating
      : ((mover?.averageRating ?? 0) * (total - 1) + review.rating) / total;

  await tx.mover.update({
    where: { id: review.moverId },
    data: { totalReviews: total, averageRating: avg },
  });

  return {
    id: review.id,
    moverId: booking.moverId,
    moveRequestId: booking.moveRequestId,
  };
}
