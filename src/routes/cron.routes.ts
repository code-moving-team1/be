// src/routes/cron.routes.ts
import { Router } from "express";
import { verifyCronAuth } from "../middlewares/cronAuth";
import cronController from "../controllers/cron.controller";

const router = Router();

// 예약 자동 완료(서비스일 경과)
router.post(
  "/internal/cron/complete-bookings",
  verifyCronAuth,
  cronController.completeBookings
);

export default router;
