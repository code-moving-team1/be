// src/services/tx/acceptAndCreateBooking.tx.ts
import {
  Prisma,
  QuoteStatus,
  BookingStatus,
  MoveRequestStatus,
  // QuoteType, // DIRECT 동기화가 필요하면 주석 해제
} from "@prisma/client";
import { createError } from "../../utils/HttpError";

type Tx = Prisma.TransactionClient;

/**
 * 견적 확정(quoteId) → MoveRequest 완료 → Booking 생성 → 나머지 견적 REJECT
 * - 콜백형 트랜잭션 안에서만 사용하세요.
 * - 반환: { id: number } (생성된 booking id)
 */
export async function acceptAndCreateBookingTx(
  tx: Tx,
  quoteId: number,
  moveRequestId: number
): Promise<{
  moverId: number; id: number 
}> {
  // 0) 대상 견적 + 스냅샷 필드 조회
  const q = await tx.quote.findUnique({
    where: { id: quoteId },
    include: { moveRequest: true, mover: true },
  });
  if (!q) throw createError("QUOTE/NOT_FOUND");

  // (방어) 컨트롤러에서 1차 검증했어도 2차 확인
  if (q.status !== QuoteStatus.PENDING) throw createError("QUOTE/NOT_PENDING");
  if (q.moveRequestId !== moveRequestId) {
    throw createError("REQUEST/VALIDATION", {
      messageOverride: "견적과 이사요청 정보가 일치하지 않습니다.",
      details: {
        quoteId,
        moveRequestIdFromQuote: q.moveRequestId,
        moveRequestId,
      },
    });
  }
  if (q.moveRequest.status !== MoveRequestStatus.ACTIVE) {
    throw createError("REQUEST/VALIDATION", {
      messageOverride: "이미 종료되었거나 확정 불가능한 요청 상태입니다.",
      details: { moveRequestStatus: q.moveRequest.status },
    });
  }

  // 1) 동일 MoveRequest로 이미 Booking이 있으면 중복 방지
  const dup = await tx.booking.findUnique({ where: { moveRequestId } });
  if (dup) throw createError("BOOKING/ALREADY_EXISTS");

  // 2) 대상 견적 ACCEPT
  await tx.quote.update({
    where: { id: quoteId },
    data: { status: QuoteStatus.ACCEPTED },
  });

  // 3) MoveRequest 완료(팀 기존 흐름 유지: 이후 다른 견적 REJECT 조건이 이 상태를 참조)
  await tx.moveRequest.update({
    where: { id: moveRequestId },
    data: { status: MoveRequestStatus.COMPLETED },
  });

  // 4) Booking 생성
  const created = await tx.booking.create({
    data: {
      moveRequestId,
      quoteId,
      customerId: q.moveRequest.customerId,
      moverId: q.moverId,
      type: q.type,
      priceSnapshot: q.price,
      status: BookingStatus.SCHEDULED, // scheduled/completed 2단계 체계
      serviceDate: q.moveRequest.moveDate, // 스냅샷
    },
    select: { id: true, moverId: true, customerId: true, moveRequestId: true },
  });

  // 5) 같은 요청의 "다른" PENDING 견적은 REJECT
  await tx.quote.updateMany({
    where: {
      moveRequestId,
      id: { not: quoteId },
      status: QuoteStatus.PENDING,
    },
    data: { status: QuoteStatus.REJECTED },
  });

  // (선택) DIRECT면 관련 DirectQuoteRequest 상태 동기화
  // if (q.type === QuoteType.DIRECT) {
  //   await tx.directQuoteRequest.updateMany({
  //     where: { moveRequestId, moverId: q.moverId },
  //     data: { status: "ACCEPTED" },
  //   });
  // }

  return created; // { id,moverId,customerId,moveRequestId }
}
