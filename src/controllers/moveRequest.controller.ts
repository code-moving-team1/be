// src/controllers/moveRequest.controller.ts
import { Request, Response } from "express";
import {
  createMoveRequestSchema,
  searchMoveRequestsSchema,
} from "../schemas/moveRequest.schema";
import moveRequestService, {
  handleCreateMoveRequest,
  handleSearchMoveRequests,
} from "../services/moveRequest.service";

//추후 에러타입 정의 및 에러 규격화 하겠습니다

const createMoveRequestController = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.id;

    if (!customerId) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }

    //zod 검사
    const parseResult = createMoveRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.format() });
    }

    const moveRequest = await handleCreateMoveRequest(
      customerId,
      parseResult.data
    );
    return res.status(201).json(moveRequest);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "서버 오류로 인해 이사요청 생성 실패",
    });
  }
};

const searchMoveRequestsController = async (req: Request, res: Response) => {
  try {
    const parseResult = searchMoveRequestsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ errors: parseResult.error.format() }); //@TODO 에러타입
    }
    //@TODO 추후 verifyAuth 적용시 req.user사용
    const user = (req as any).user;
    const moverId = user?.userType === "MOVER" ? user.id : undefined;
    const { meta, data } = await handleSearchMoveRequests(
      parseResult.data,
      moverId
    );

    return res.status(200).json({ meta, data });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "검색하여 GET 실패" });
  }
};

const getActiveListByCustomer = async (req: Request, res: Response) => {
  const customerId = (req as any).user.id;
  try {
    const result = await moveRequestService.getListByCustomer(customerId, true);
    if (!result) {
      return res.status(400).json({ error: "리스트 없음" });
    }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "고객 이사 요청 리스트(대기 중) GET 실패",
    });
  }
};

const getClosedListByCustomer = async (req: Request, res: Response) => {
  const customerId = (req as any).user.id;
  try {
    const result = await moveRequestService.getListByCustomer(
      customerId,
      false
    );
    if (!result) {
      return res.status(400).json({ error: "리스트 없음" });
    }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "고객 이사 요청 리스트(종료됨) GET 실패",
    });
  }
};

const getListByCustomerWhenDirect = async (req: Request, res: Response) => {
  const customerId = (req as any).user?.id;
  try {
    const result = await moveRequestService.getListByCustomerWhenDirect(
      customerId
    );
    if (!result) {
      return res.status(400).json({ error: "리스트 없음" });
    }
    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "고객 이사 요청 리스트(대기 중) GET 실패",
    });
  }
};

export default {
  createMoveRequestController,
  searchMoveRequestsController,
  getActiveListByCustomer,
  getClosedListByCustomer,
  getListByCustomerWhenDirect,
};
