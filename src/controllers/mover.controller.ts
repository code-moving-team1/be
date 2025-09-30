import { NextFunction, Request, Response } from "express";
import moverService from "../services/mover.service";
import { createError } from "../utils/HttpError";

const getList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await moverService.getList();
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export default {
  getList,
};
