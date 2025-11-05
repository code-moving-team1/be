// src/controllers/cron.controller.ts
import { Request, Response, NextFunction } from "express";
import { completeOverdueBookings,finishOverdueMoveRequests } from "../services/cron.service";
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


/**
 * 오늘(Asia/Seoul) 00:00 기준으로 이미 지난 moveRequest 중
 * - status = ACTIVE
 * - booking = null
 * 을 FINISHED 로 전환한다.
 * 
 * Optional: ?preview=true  -> 실제 변경 없이 대상만 반환
 */
const finishOverdueMoveRequestsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const preview = String(req.query.preview ?? "false") === "true";
    const result = await finishOverdueMoveRequests({ preview });
    return res.status(200).json({
      message: preview
        ? "Preview only (no updates applied)"
        : "MoveRequest finish sweep finished",
      ...result,
    });
  } catch (err) {
    next(
      createError("SERVER/INTERNAL", {
        cause: err,
        messageOverride: "finishOverdueMoveRequests 실행 중 오류가 발생했습니다.",
      })
    );
  }
};


export default { completeBookings , finishOverdueMoveRequests: finishOverdueMoveRequestsHandler };
