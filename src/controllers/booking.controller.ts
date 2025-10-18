// src/controllers/booking.controller.ts
import { Request, Response, NextFunction } from "express";

import { createError } from "../utils/HttpError";
import bookingService from "../services/booking.service";

const getReviewables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any)?.user;
    const customerId = user?.id as number | undefined;
    const userType = user?.type as "CUSTOMER" | "MOVER" | undefined;

    if (!customerId) return next(createError("AUTH/UNAUTHORIZED"));
    if (userType && userType !== "CUSTOMER") {
      return next(createError("REVIEW/FORBIDDEN", { messageOverride: "고객만 접근 가능합니다." }));
    }

    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);

    const result = await bookingService.getReviewables(customerId, { page, pageSize });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export default { getReviewables };
