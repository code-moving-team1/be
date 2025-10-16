import { NextFunction, Request, Response } from "express";
import directQuoteRequestService from "../services/directQuoteRequest.service";
import moveRequestService from "../services/moveRequest.service";
import { createError } from "../utils/HttpError";
import moverService from "../services/mover.service";

const getListByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerId = (req as any).user?.id;
  try {
    const result = await directQuoteRequestService.getListByCustomer(
      customerId
    );
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const getRejectedListByMover = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const moverId = (req as any).user?.id;
  const { userType } = (req as any).user;

  if (userType !== "MOVER") {
    createError("AUTH/FORBIDDEN");
  }

  try {
    const result = await directQuoteRequestService.getRejectedListByMover(
      moverId
    );
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { customerId, userType } = (req as any).user;
  const { moveRequestId, moverId } = req.body;

  // userType이 customer가 아니거나, moveRequest의 customerId가 현재 접속한 고객 아이디와 일치하지 않는 경우
  // 권한 에러 발생
  const moveRequest = await moveRequestService.getById(moveRequestId);
  if (userType !== "CUSTOMER" || moveRequest?.customerId !== customerId) {
    createError("AUTH/UNAUTHORIZED", {
      messageOverride:
        "해당 항목에 대해 지정 견적 요청을 보낼 권한이 없습니다. 계정을 다시 한 번 확인해주세요.",
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
  const { id: moverId, userType } = (req as any).user;
  const id = Number(req.params.id);
  const { comment } = req.body;

  // comment가 10글자 미만인 경우 에러 생성
  if (comment.length < 10) {
    createError("AUTH/VALIDATION", {
      messageOverride: "반려 사유는 10글자 이상 입력해야 합니다.",
    });
  }

  // userType이 mover가 아니거나, 지정 견적 요청을 받은 기사 아이디와 현재 접속한 기사의 아이디가 다른 경우
  // 권한 에러 발생
  const directRequest = await directQuoteRequestService.getById(id);
  if (userType !== "MOVER" || directRequest?.moverId !== moverId) {
    createError("AUTH/UNAUTHORIZED", {
      messageOverride:
        "해당 항목에 대해 반려하기를 수행할 권한이 없습니다. 계정을 다시 한 번 확인해주세요.",
    });
  }

  try {
    const result = await directQuoteRequestService.updateToRejected(
      id,
      comment
    );
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
  getListByCustomer,
  getRejectedListByMover,
  create,
  updateToAccepted,
  updateToRejected,
  updateToExpired,
};
