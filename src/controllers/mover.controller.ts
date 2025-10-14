import { NextFunction, Request, Response } from "express";
import moverService from "../services/mover.service";

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

export default {
  getProfile,
  getList,
  getLikesList,
};
