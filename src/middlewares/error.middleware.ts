import { Request, Response, NextFunction } from "express";
import HttpError from "../utils/HttpError";

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        type: err.errorType ?? "unknown",
      },
    });
  }

  return res.status(500).json({
    error: {
      message: "Internal Server Error",
      type: "unknown",
    },
  });
};
