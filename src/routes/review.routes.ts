// src/routes/review.routes.ts
import { Router } from "express";
import reviewController from "../controllers/review.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

// 예약(Booking) 기준 리뷰 작성 — 고객만
router.post("/bookings/:bookingId", verifyAuth, reviewController.create);

// 내가 작성한 리뷰 목록
router.get("/my", verifyAuth, reviewController.listMine);

// 이사업체별 리뷰 목록 조회
router.get("/mover/:moverId", reviewController.getListByMover);

export default router;
