import { NextFunction, Request, Response } from "express";
import directQuoteRequestService from "../services/directQuoteRequest.service";

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { moveRequestId, moverId } = req.body;
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
