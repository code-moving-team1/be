// src/routes/quote.routes.ts
import { Router } from "express";
import quoteController from "../controllers/quote.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

// 특정 이사 요청에 대한 견적 목록 조회
router.get("/move-requests/:moveRequestId", quoteController.getListByRequest);

// 특정 이사 요청에 견적 제출
router.post(
  "/move-requests/:moveRequestId",
  verifyAuth,
  quoteController.submit
);

// 특정 견적 확정 (accepted로 변경하고 나머지 rejected로 변경)
router.patch("/:id/accept", verifyAuth, quoteController.updateAllIfAccepted);

// 견적 상세 페이지
router.get("/:id", verifyAuth, quoteController.getDetail);

router.get("/quotes/:id", verifyAuth, quoteController.getMyQuoteDetail);

// 지정 요청에 대해 견적 제출
// router.post(
//   "/direct/move-requests/:moveRequestId",
//   verifyAuth,
//   quoteController.submitIfDirect,
//   quoteController.submit
// );

export default router;
