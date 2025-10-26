import { NextFunction, Request, Response } from "express";
import moverService from "../services/mover.service";
import { createError } from "../utils/HttpError";
import { saveTokens } from "../services/auth.service";
import { setTokenCookie } from "./auth.controller";

const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await moverService.getProfile(id);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = req.query;
    const result = await moverService.getList(filters);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const getLikesList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: customerId } = req.user as { id: number };
    const result = await moverService.getLikesList(customerId);
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

const updateInitProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, userType, hasProfile } = (req as any).user;

  // 유저 타입이 MOVER가 아니거나 hasProfile이 이미 true라면 에러 처리
  if (userType !== "MOVER" || hasProfile) {
    throw createError("AUTH/FORBIDDEN", {
      messageOverride: "해당 요청에 대한 권한이 없습니다.",
    });
  }

  try {
    const result = await moverService.updateInitProfile({
      id,
      ...req.body,
    });
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

export default {
  getProfile,
  getList,
  getLikesList,
  updateInitProfile,
};
