import { Prisma, QuoteType } from "@prisma/client";
import quoteRepo from "../repositories/quote.repository";
import { SubmitQuoteBody } from "../schemas/quote.schema";
import { createError } from "../utils/HttpError";
import * as moverRepo from "../repositories/mover.repository";
import { getMoveRequestById } from "../repositories/moveRequest.repository";

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

  if (type === "DIRECT") {
    const directQuote = await getTestCodeDirectQuoteRequest(
      moveRequestId,
      moverId
    );
    if (!directQuote) {
      throw createError("REQUEST/VALIDATION", {
        messageOverride: "직접 견적 요청이 없거나 유효하지 않습니다.",
        details: { moveRequestId, moverId, type },
      });
    }
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

const getListByRequest = async (moveRequestId: number) => {
  const result = await quoteRepo.getListByRequest(moveRequestId);
  return result;
};

const updateAllIfAccepted = async (moveRequestId: number, id: number) => {
  const rejected = await quoteRepo.updateAllToRejected(moveRequestId);
  const accepted = await quoteRepo.updateToAccepted(id);
  return accepted;
};
export default {
  submit,
  getListByRequest,
  updateAllIfAccepted,
};
