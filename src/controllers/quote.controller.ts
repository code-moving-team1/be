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
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export default {
  submit,
  getListByRequest,
};
