import { Request, Response, NextFunction } from "express";
import {
  SubmitQuoteBodySchema,
  type SubmitQuoteBody,
} from "../schemas/quote.schema";
import quoteService from "../services/quote.service";
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
    const customerId = (req as any)?.user?.id as number;

    // accept로 변경할 quote 아이디로 quote가 속한 moveRequestId 찾기
    const quote = await quoteService.getById(id);

    if (!quote || quote.moveRequest.status !== "ACTIVE") {
      // quote가 있어야 함. 그리고 quote의 주인인 moveRequest의 상태는 "ACTIVE"여야만 함
      next(Error);
    }

    const moveRequestId = quote?.moveRequestId as number;

    // 현재 요청을 보낸 user(토큰으로 확인)와 moveRequest의 소유자인 customerId가 같은지 검증하기
    if (customerId !== quote?.moveRequest.customerId) {
      next(Error);
    }

    const result = await quoteService.updateAllIfAccepted(id, moveRequestId);
    return res.status(200).json({ message: "견적 확정 성공" });
  } catch (err) {
    next(err);
  }
};

export default {
  submit,
  getListByRequest,
  updateAllIfAccepted,
};
