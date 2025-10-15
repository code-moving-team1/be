import { NextFunction, Request, Response } from "express";
import customerService from "../services/customer.service";
import { createError } from "../utils/HttpError";

const updateInitProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, userType, hasProfile } = (req as any).user;
  const { region, serviceTypes, img } = req.body;

  // 유저 타입이 customer가 아니거나 hasProfile이 이미 true라면 에러 처리
  if (userType !== "CUSTOMER" || hasProfile) {
    throw createError("AUTH/FORBIDDEN", {
      messageOverride: "해당 요청에 대한 권한이 없습니다.",
    });
  }

  try {
    await customerService.updateInitProfile(id, region, serviceTypes, img);
    return res.status(200).json({ message: "초기 프로필 업데이트 성공" });
  } catch (e) {
    next(e);
  }
};

export default {
  updateInitProfile,
};
