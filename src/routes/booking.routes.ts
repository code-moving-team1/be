// src/routes/booking.routes.ts
import { Router } from "express";
import { verifyAuth } from "../middlewares/auth";
import bookingController from "../controllers/booking.controller";

const router = Router();

// [고객] 리뷰 작성 가능 예약 목록 조회
router.get("/reviewables", verifyAuth, bookingController.getReviewables);

export default router;
