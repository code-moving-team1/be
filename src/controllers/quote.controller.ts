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

const getListByRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const moveRequestId = Number(req.params.moveRequestId);
  try {
    const result = await quoteService.getListByRequest(moveRequestId);
    return res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

const updateAllIfAccepted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @TODO Error 처리 관련해서 좀 더 디테일하게 작성해야 함
    const id = Number(req.params.id);
    const customerId = (req as any)?.user?.id as number;

    // accept로 변경할 quote 아이디로 quote가 속한 moveRequestId 찾기
    const quote = await quoteService.getById(id);

    if (!quote) {
      // quote가 없으면 안 됨
      next(Error);
    }

    const moveRequestId = quote?.moveRequestId as number;

    // 현재 요청을 보낸 user(토큰으로 확인)와 moveRequest의 소유자인 customerId가 같은지 검증하기
    if (customerId !== quote?.moveRequest.customerId) {
      next(Error);
    }

    const result = await quoteService.updateAllIfAccepted(id, moveRequestId);
    console.log(result);
    return res.status(200).json({ message: "견적 확정 성공" });
  } catch (err) {
    next(err);
  }
};

export default {
  submit,
  getListByRequest,
  updateAllIfAccepted,
};
