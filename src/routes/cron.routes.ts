// src/routes/cron.routes.ts
import { Router } from "express";
import { verifyCronAuth } from "../middlewares/cronAuth";
import cronController from "../controllers/cron.controller";

const router = Router();

// 예약 자동 완료(서비스일 경과) booking status scheduled-> completed
router.post(
  "/internal/cron/complete-bookings",
  verifyCronAuth,
  cronController.completeBookings
);

// 오늘(KST)보다 지난 ACTIVE MoveRequest(booking=null) -> FINISHED
router.post(
  "/internal/cron/finish-move-requests",
  verifyCronAuth,
  cronController.finishOverdueMoveRequests
);


export default router;
