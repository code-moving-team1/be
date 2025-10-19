// src/middlewares/cronAuth.ts
import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/HttpError";

export function verifyCronAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = req.header("X-Cron-Token");
  if (!token || token !== process.env.CRON_TOKEN) {
    return next(
      createError("AUTH/UNAUTHORIZED", {
        messageOverride: "Invalid or missing X-Cron-Token",
      })
    );
  }
  next();
}
