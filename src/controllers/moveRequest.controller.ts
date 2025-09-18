// src/controllers/moveRequest.controller.ts
import { Request, Response } from "express";
import { createMoveRequestSchema } from "../schemas/moveRequest.schema";
import { handleCreateMoveRequest } from "../services/moveRequest.service";

//추후 에러타입 정의 및 에러 규격화 하겠습니다

export const createMoveRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    //@any
    // const customerId = (req as any).user?.id; // 로그인 미들웨어에서 넘어왔다고 가정

    const customerId = 3; //@우진수정 나중에 auth붙으면 하드코딩 삭제 예정
    if (!customerId) {
      return res.status(401).json({ message: "로그인이 필요합니다" });
    }

    //zod
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
