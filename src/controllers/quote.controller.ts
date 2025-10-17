// src/controllers/quote.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  SubmitQuoteBodySchema,
  type SubmitQuoteBody,
} from "../schemas/quote.schema";
import quoteService, { getQuoteDetail } from "../services/quote.service";
import { createError } from "../utils/HttpError";
import { ZodError } from "zod";

const submit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const moveRequestId = Number(req.params.moveRequestId);
    if (!Number.isFinite(moveRequestId)) {
      return next(
        createError("REQUEST/VALIDATION", {
          messageOverride: "유효하지 않은 moveRequestId 입니다.",
          details: { raw: req.params.moveRequestId },
        })
      );
    }

    const moverId =
      (req as any)?.user?.id ?? (req.body?.moverId as number | undefined);

    if (!moverId) {
      return next(createError("AUTH/UNAUTHORIZED"));
    }

    let payload: SubmitQuoteBody;
    try {
      payload = SubmitQuoteBodySchema.parse(req.body);
    } catch (e) {
      if (e instanceof ZodError) {
        return next(
          createError("REQUEST/VALIDATION", {
            details: { issues: e.issues },
          })
        );
      }
      throw e;
    }

    const result = await quoteService.submit(moverId, moveRequestId, payload);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getListByRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const moveRequestId = Number(req.params.moveRequestId);
    if (!Number.isFinite(moveRequestId)) {
      return next(
        createError("REQUEST/VALIDATION", {
          messageOverride: "유효하지 않은 moveRequestId 입니다.",
          details: { raw: req.params.moveRequestId },
        })
      );
    }
    const result = await quoteService.getListByRequest(moveRequestId);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const updateAllIfAccepted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @TODO Error 처리 관련해서 좀 더 디테일하게 작성해야 함
    const id = Number(req.params.id);
    const user = (req as any)?.user;
    const customerId = user.id as number | undefined;

    if (!Number.isFinite(id)) {
      return next(
        createError("REQUEST/VALIDATION", {
          messageOverride: "유효하지 않은 quoteId 입니다.",
          details: { raw: req.params.id },
        })
      );
    }
    if (!customerId) {
      return next(createError("AUTH/UNAUTHORIZED"));
    }

    // accept로 변경할 quote 아이디로 quote가 속한 moveRequestId 찾기
    const quote = await quoteService.getById(id);
    if (!quote) {
      return next(createError("QUOTE/NOT_FOUND"));
    }

    if (quote.moveRequest.status !== "ACTIVE") {
      // quote가 있어야 함. 그리고 quote의 주인인 moveRequest의 상태는 "ACTIVE"여야만 함
      return next(
        createError("REQUEST/VALIDATION", {
          messageOverride: "이미 종료되었거나 확정 불가능한 요청 상태입니다.",
          details: { moveRequestStatus: quote.moveRequest.status },
        })
      );
    }

    const moveRequestId = quote?.moveRequestId as number;

    // 현재 요청을 보낸 user(토큰으로 확인)와 moveRequest의 소유자인 customerId가 같은지 검증하기
    if (customerId !== quote?.moveRequest.customerId) {
      return next(createError("QUOTE/FORBIDDEN"));
    }

    // ⚠️ 서비스가 booking을 생성해 반환하도록만 위임
    const booking = await quoteService.updateAllIfAccepted(
      id,
      quote.moveRequestId
    );

    // const result = await quoteService.updateAllIfAccepted(id, moveRequestId);
    return res.status(201).json({
      message: "견적 확정 성공 + booking 레코드 생성!",
      bookingId: booking.id,
    });
  } catch (err) {
    next(err);
  }
};

const submitIfDirect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.type = "DIRECT";
  next();
};
// 견적 상세 페이지
const getDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quoteId = Number(req.params.id);
    const customerId = (req as any).user?.id;
    const userType = (req as any).user?.userType;

    if (!customerId || userType !== "CUSTOMER") {
      return res.status(401).json({ message: "고객 로그인 필요" });
    }

    const data = await getQuoteDetail(quoteId, customerId);
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
};

export default {
  submit,
  getListByRequest,
  updateAllIfAccepted,
  submitIfDirect,
  getDetail,
};
