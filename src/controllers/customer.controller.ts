import { NextFunction, Request, Response } from "express";
import customerService from "../services/customer.service";
import { createError } from "../utils/HttpError";
import { saveTokens } from "../services/auth.service";
import { setTokenCookie } from "./auth.controller";

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
    const result = await customerService.updateInitProfile(
      id,
      region,
      serviceTypes,
      img
    );
    const { accessToken, refreshToken } = await saveTokens(
      result.id,
      userType,
      result.hasProfile
    );
    setTokenCookie(res, "accessToken", accessToken);
    setTokenCookie(res, "refreshToken", refreshToken);
    return res.status(200).json({ message: "초기 프로필 업데이트 성공" });
  } catch (e) {
    next(e);
  }
};

const updateBasicInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, userType } = (req as any).user;

  // 유저 타입이 CUSTOMER가 아니면 에러 처리
  if (userType !== "CUSTOMER") {
    throw createError("AUTH/FORBIDDEN", {
      messageOverride: "해당 요청에 대한 권한이 없습니다.",
    });
  }

  try {
    const result = await customerService.updateBasicInfo({
      id,
      ...req.body,
    });
    return res.status(200).json({ message: "기본정보 업데이트 성공" });
  } catch (e) {
    next(e);
  }
};

export default {
  updateInitProfile,
  updateBasicInfo,
};
