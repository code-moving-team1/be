import { NextFunction, Request, Response } from "express";
import directQuoteRequestService from "../services/directQuoteRequest.service";
import moveRequestService from "../services/moveRequest.service";
import { createError } from "../utils/HttpError";

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { id, userType } = (req as any).user;
  const { moveRequestId, moverId } = req.body;

  // userType이 customer가 아니거나, moveRequest의 customerId가 현재 접속한 고객 아이디와 일치하지 않는 경우
  // 권한 에러 발생
  const moveRequest = await moveRequestService.getById(moveRequestId);
  if (userType !== "CUSTOMER" || moveRequest?.customerId !== id) {
    createError("AUTH/UNAUTHORIZED", {
      messageOverride:
        "해당 항목에 대해 지정 견적 요청을 보낼 권한이 없습니다.",
    });
  }

  try {
    const result = await directQuoteRequestService.create(
      moveRequestId,
      moverId
    );
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const updateToAccepted = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await directQuoteRequestService.updateToAccepted(id);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const updateToRejected = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await directQuoteRequestService.updateToRejected(id);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const updateToExpired = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);
  try {
    const result = await directQuoteRequestService.updateToExpired(id);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export default {
  create,
  updateToAccepted,
  updateToRejected,
  updateToExpired,
};
