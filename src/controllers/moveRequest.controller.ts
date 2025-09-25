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

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}
//추후 에러타입 정의 및 에러 규격화 하겠습니다

const createMoveRequestController = async (req: Request, res: Response) => {
  try {
    //@any
    // const customerId = (req as any).user?.id; // 로그인 미들웨어에서 넘어왔다고 가정

    const customerId = 1; //@우진수정 나중에 auth붙으면 하드코딩 삭제 예정
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
    const { meta, data } = await handleSearchMoveRequests(parseResult.data);

    return res.status(200).json({ meta, data });
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "검색하여 GET 실패" });
  }
};

const getActiveListByCustomer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const customerId = req.user?.id || 0;
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

const getClosedListByCustomer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const customerId = req.user?.id || 0;
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

export default {
  createMoveRequestController,
  searchMoveRequestsController,
  getActiveListByCustomer,
  getClosedListByCustomer,
};
