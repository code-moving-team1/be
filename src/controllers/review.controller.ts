// src/controllers/review.controller.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import reviewService from "../services/review.service";
import { createError } from "../utils/HttpError";
import {
  CreateReviewBodySchema,
  type CreateReviewBody,
} from "../schemas/review.schema";

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!Number.isFinite(bookingId)) {
      return next(
        createError("REQUEST/VALIDATION", {
          messageOverride: "유효하지 않은 bookingId 입니다.",
          details: { raw: req.params.bookingId },
        })
      );
    }

    const user = (req as any)?.user;
    const customerId = user?.id as number | undefined;
    if (!customerId) {
      return next(createError("AUTH/UNAUTHORIZED"));
    }

    let payload: CreateReviewBody;
    try {
      payload = CreateReviewBodySchema.parse(req.body);
    } catch (e) {
      if (e instanceof ZodError) {
        return next(
          createError("REQUEST/VALIDATION", { details: { issues: e.issues } })
        );
      }
      throw e;
    }

    const { id } = await reviewService.create(customerId, bookingId, payload);

    return res.status(201).json({
      message: "리뷰가 등록되었습니다.",
      reviewId: id,
    });
  } catch (err) {
    next(err);
  }
};

export default { create };
