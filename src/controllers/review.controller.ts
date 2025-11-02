// src/controllers/review.controller.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import reviewService from "../services/review.service";
import { createError } from "../utils/HttpError";
import {
  CreateReviewBodySchema,
  MyReviewQuery,
  MyReviewQuerySchema,
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

const listMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any)?.user;
    const customerId = user?.id as number | undefined;
    if (!customerId) return next(createError("AUTH/UNAUTHORIZED"));

    let query: MyReviewQuery;
    try {
      query = MyReviewQuerySchema.parse(req.query);
    } catch (e) {
      if (e instanceof ZodError) {
        return next(
          createError("REQUEST/VALIDATION", { details: { issues: e.issues } })
        );
      }
      throw e;
    }

    const result = await reviewService.listMyReviews(customerId, {
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

const getListByMover = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const moverId = Number(req.params.moverId);
    const page = Number(req.query.page);
    if (!Number.isFinite(moverId)) {
      return next(
        createError("REQUEST/VALIDATION", {
          messageOverride: "유효하지 않은 기사ID입니다.",
          details: { raw: req.params.moverId },
        })
      );
    }

    const result = await reviewService.getListByMover(moverId, page);

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export default { create, listMine, getListByMover };
