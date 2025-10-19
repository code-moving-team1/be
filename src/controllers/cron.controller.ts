// src/controllers/cron.controller.ts
import { Request, Response, NextFunction } from "express";
import { completeOverdueBookings } from "../services/cron.service";
import { createError } from "../utils/HttpError";

const completeBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ?graceHours=6 같은 식으로 조절 가능(옵션)
    const raw = req.query.graceHours as string | undefined;
    const graceHours = raw ? Number(raw) : 6;
    if (Number.isNaN(graceHours) || graceHours < 0 || graceHours > 48) {
      return next(
        createError("REQUEST/VALIDATION", {
          messageOverride: "유효하지 않은 graceHours 입니다. (0~48)",
          details: { raw },
        })
      );
    }

    const result = await completeOverdueBookings(graceHours);
    return res.status(200).json({
      message: "Booking auto-complete sweep finished",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export default { completeBookings };
