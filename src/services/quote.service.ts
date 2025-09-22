import { Prisma } from "@prisma/client";
import { createQuote } from "../repositories/quote.repository";
import { SubmitQuoteBody } from "../schemas/quote.schema";
import { QuoteType } from "@prisma/client";

class AppError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const submitQuote = async (
  moverId: number,
  moveRequestId: number,
  payload: SubmitQuoteBody
) => {
  const mover = await getTestCodeMoverById(moverId);
  if (!mover) {
    throw new AppError(403, "잘못된 기사 계정입니다.");
  }

  const moveRequest = await getTestCodeMoveRequestById(moveRequestId);
  if (!moveRequest) {
    throw new AppError(
      404,
      "해당 이사 요청을 찾을 수 엽거나 현재 견적을 받지 않습니다."
    );
  }

  const type = (payload.type ?? "normal") as QuoteType;

  if (type === "direct") {
    const directQuote = await getTestCodeDirectQuoteRequest(
      moveRequestId,
      moverId
    );
    if (!directQuote) {
      throw new AppError(403, "직접 견적 요청이 없거나 유효하지 않습니다.");
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
        throw new AppError(
          409,
          "이미 동일 유형의 견적을 제출했습니다.",
          "QUOTE_DUPLICATED"
        );
      }
    }
    throw new AppError(500, "견적 제출 중 오류가 발생했습니다.");
  }
};

export { AppError };
