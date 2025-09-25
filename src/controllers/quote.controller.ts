import { Request, Response, NextFunction } from "express";
import { SubmitQuoteBodySchema } from "../schemas/quote.schema";
import quoteService from "../services/quote.service";

const submit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const moveRequestId = Number(req.params.moveRequestId);
    if (!Number.isFinite(moveRequestId)) {
      return res.status(400).json({
        code: "REQUEST/VALIDATION",
        message: "유효하지 않은 moveRequestId 입니다.",
        details: { raw: req.params.moveRequestId },
      });
    }

    const moverId =
      (req as any)?.user?.id ?? (req.body?.moverId as number | undefined);

    if (!moverId) {
      return res.status(401).json({
        code: "AUTH/UNAUTHORIZED",
        message: "기사 인증이 필요합니다.",
      });
    }

    const payload = req.body as SubmitQuoteBody;
    const result = await quoteService.submit(moverId, moveRequestId, payload);
    return res.status(201).json(result);
  } catch (err) {
    // ✅ 반드시 catch 블록으로 넘겨 에러 핸들러가 처리하도록
    next(err);
  }
};

const getListByRequest = async (req: Request, res: Response) => {
  const moveRequestId = Number(req.params.moveRequestId);
  try {
    const result = await quoteService.getListByRequest(moveRequestId);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(500).json({ error: "에러 발생" });
  }
};

export default {
  submit,
  getListByRequest,
};
