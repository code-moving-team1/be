import { Router } from "express";
import reviewController from "../controllers/review.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

// 예약(Booking) 기준 리뷰 작성 — 고객만
router.post(
  "/bookings/:bookingId",
  verifyAuth,
  reviewController.create
);

export default router;
