import { Prisma } from "@prisma/client";
import { createQuote } from "../repositories/quote.repository";
import { SubmitQuoteBody } from "../schemas/quote.schema";
import { QuoteType } from "@prisma/client";
import HttpError from "../utils/HttpError";

export const submitQuote = async (
  moverId: number,
  moveRequestId: number,
  payload: SubmitQuoteBody
) => {
  const mover = await getTestCodeMoverById(moverId);
  if (!mover) {
    throw new HttpError(403, "잘못된 기사 계정입니다.", "auth");
  }

  const moveRequest = await getTestCodeMoveRequestById(moveRequestId);
  if (!moveRequest) {
    throw new HttpError(404, "해당 이사 요청을 찾을 수 없습니다.", "notfound");
  }

  const type = (payload.type ?? "normal") as QuoteType;

  if (type === "direct") {
    const directQuote = await getTestCodeDirectQuoteRequest(
      moveRequestId,
      moverId
    );
    if (!directQuote) {
      throw new HttpError(
        403,
        "직접 견적 요청이 없거나 유효하지 않습니다.",
        "notfound"
      );
    }
  }

  try {
    const created = await createQuote({
      price: payload.price,
      comment: payload.comment ?? "",
      moveRequestId,
      moverId,
      type,
    });
    return created;
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new HttpError(
          409,
          "이미 동일 유형의 견적을 제출했습니다.",
          "validation"
        );
      }
    }
    throw new HttpError(500, "견적 제출 중 오류가 발생했습니다.");
  }
};
