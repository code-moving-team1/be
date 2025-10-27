// src/services/quote.service.ts
import {
  Prisma,
  PrismaPromise,
  QuoteType,
  QuoteStatus,
  BookingStatus,
  MoveRequestStatus,
  DirectRequestStatus,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import quoteRepo, {
  getQuoteById,
  getMyQuoteDetail,
} from "../repositories/quote.repository";

import bookingRepo from "../repositories/booking.repository";
import { SubmitQuoteBody } from "../schemas/quote.schema";
import { createError } from "../utils/HttpError";
import * as moverRepo from "../repositories/mover.repository";
import moveRequestRepo, {
  getMoveRequestById,
} from "../repositories/moveRequest.repository";
import directQuoteRequestRepo from "../repositories/directQuoteRequest.repository";
import { acceptAndCreateBookingTx } from "./tx/acceptAndCreateBooking.tx";
import { notifyCustomer, notifyMover } from "./notification.service";
import { notificationLink } from "../constants/notification.links";

type Tx = Prisma.TransactionClient;

// ✅ 문자열/enum을 항상 Prisma Enum으로 정규화
const normalizeQuoteType = (raw?: string | QuoteType): QuoteType => {
  if (!raw) return QuoteType.NORMAL;
  const s = String(raw).toUpperCase();
  return s === "DIRECT" ? QuoteType.DIRECT : QuoteType.NORMAL;
};

const submit = async (
  moverId: number,
  moveRequestId: number,
  payload: SubmitQuoteBody
) => {
  const mover = await moverRepo.findById(moverId);
  if (!mover) {
    throw createError("AUTH/UNAUTHORIZED", {
      messageOverride: "잘못된 기사 계정입니다.", // 기본 카탈로그 메시지 대신 적용
      details: { moverId }, // context 정보는 details에 담음 → 에러 응답 body에도 포함됨
    });
  }

  const moveRequest = await getMoveRequestById(moveRequestId);
  if (!moveRequest) {
    throw createError("REQUEST/NOT_FOUND", {
      messageOverride: "해당 이사 요청을 찾을 수 없습니다.",
      details: { moveRequestId },
    });
  }

  const type = normalizeQuoteType(payload.type as any);

  let directQuoteReq: { id: number } | null = // 최소 필요한 필드만
    null;

  // TODO: DIRECT 타입 견적에 대한 검증 로직 구현 필요
  if (type === "DIRECT") {
    const directQuote = await directQuoteRequestRepo.getByMoverAndRequest(
      moverId,
      moveRequestId
    );
    if (!directQuote || directQuote?.status !== "PENDING") {
      throw createError("REQUEST/VALIDATION", {
        messageOverride: "직접 견적 요청이 없거나 유효하지 않습니다.",
        details: { moveRequestId, moverId, type },
      });
    }
    directQuoteReq = { id: directQuote.id };
  }

  // 생성 + 에러 매핑
  try {
    const created = await quoteRepo.create({
      price: payload.price,
      comment: payload.comment ?? "",
      moveRequestId,
      moverId,
      type,
    });

    //@TODO tx 묶어야하긴함
    // ✅ 추가: DIRECT 견적 제출 성공 시 지정요청을 ACCEPTED로 전환
    if (type === QuoteType.DIRECT && directQuoteReq) {
      try {
        await directQuoteRequestRepo.update(
          directQuoteReq.id,
          DirectRequestStatus.ACCEPTED // 또는 "ACCEPTED"
        );
      } catch (e) {
        // 여기서 실패해도 견적 자체는 유효하므로 롤백하지 않고 로그만(선택)
        // 필요 시 P2025 무시 분기 추가 가능
        console.log(
          "direct quote 생성 중 directQuoteStatus Accepted로 변경 실패"
        );
      }
    }

    await notifyCustomer(moveRequest.customerId, {
      type: "NEW_QUOTE_RECEIVED",
      content: "내 이사요청에 새 견적이 도착했어요.",
      link: notificationLink.newQuoteReceived(moveRequestId),
      // link: `/myEstimates/${moveRequestId}`,
    });

    return created;
  } catch (error) {
    // Prisma에서 발생한 에러 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // 고유 제약(중복 제출)
        throw createError("QUOTE/DUPLICATE", {
          ...(process.env.NODE_ENV === "development"
            ? {
                details: {
                  code: error.code, //"P2002" 같은 Prisma 에러 코드
                  meta: error.meta, // Prisma가 제공하는 추가 정보
                  moverId, // 누가(기사) 시도했는지
                  moveRequestId, // 어느 요청에 대해
                  type, // 어떤 견적 유형(normal/direct)
                },
              }
            : {}),
          cause: error,
        });
      }
      // 그 외 Prisma known error
      throw createError("SERVER/INTERNAL", {
        messageOverride: "데이터베이스 처리 중 오류가 발생했습니다.",
        ...(process.env.NODE_ENV === "development"
          ? { details: { code: error.code, meta: error.meta } }
          : {}),
        cause: error,
      });
    }

    // 알 수 없는 에러
    throw createError("SERVER/INTERNAL", {
      messageOverride: "견적 제출 중 오류가 발생했습니다.",
      ...(process.env.NODE_ENV === "development"
        ? { details: { moverId, moveRequestId, type } }
        : {}),
      cause: error,
    });
  }
};

const getById = async (id: number) => {
  const result = await quoteRepo.getById(id);
  return result;
};

const getListByRequest = async (moveRequestId: number) => {
  const result = await quoteRepo.getListByRequest(moveRequestId);
  return result;
};

const updateAllIfAccepted = async (id: number, moveRequestId: number) => {
  // 트랜잭션을 사용하여 모든 작업을 원자적으로 처리
  // 하나라도 실패하면 모든 작업이 롤백됨
  try {
    const booking = await prisma.$transaction(tx =>
      acceptAndCreateBookingTx(tx, id, moveRequestId)
    );

    // await notifyMover(booking.id, {
    await notifyMover(booking.moverId, {
      type: "QUOTE_ACCEPTED",
      content: "고객이 당신의 견적을 확정했어요.",
      link: notificationLink.quoteAccepted(moveRequestId),
    });

    return booking;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // 유니크 충돌 → 이미 다른 경합으로 Booking 생성된 케이스
      throw createError("BOOKING/ALREADY_EXISTS", { cause: error });
    }
    if ((error as any)?.name === "HttpError") throw error;

    throw createError("SERVER/INTERNAL", {
      messageOverride: "견적 확정 중 트랜잭션 오류로 요청이 취소되었습니다.",
      cause: error,
    });
  }
};

// 견적 상세페이지
export const getQuoteDetail = async (id: number, customerId: number) => {
  const q = await getQuoteById(id);
  if (!q) {
    throw createError("QUOTE/NOT_FOUND", {
      messageOverride: "견적을 찾을 수 없습니다.",
    });
  }
  if (q.moveRequest?.customerId !== customerId) {
    throw createError("AUTH/UNAUTHORIZED", {
      messageOverride: "접근 권한이 없습니다.",
    });
  }
  return q;
};

export const handleGetMyQuoteDetail = async (
  quoteId: number,
  moverId: number
) => {
  return await getMyQuoteDetail(quoteId, moverId);
};

export default {
  submit,
  getById,
  getListByRequest,
  updateAllIfAccepted,
  getQuoteDetail,
  handleGetMyQuoteDetail,
};
