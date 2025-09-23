import { Request, Response, NextFunction } from "express";
import { SubmitQuoteBodySchema } from "../schemas/quote.schema";
import { submitQuote } from "../services/quote.service";

export const submitQuoteController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const moverId = (req as any).user?.id as number;
    const moveRequest = Number(req.params.moveRequestId);
    const parsed = SubmitQuoteBodySchema.parse(req.body);
    const result = await submitQuote(moverId, moveRequestId, parsed);
    return res.status(201).json({data: result})
  }
}