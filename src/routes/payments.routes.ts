// src/routes/payments.routes.ts
import { Router } from "express";
import auth from "../middlewares/auth";
import { PaymentsController } from "../controllers/payments.controller";

const router = Router();

// POST /api/payments/toss/confirm
router.post("/toss/confirm", auth.verifyAuth, PaymentsController.confirmToss);

// ✅ 내 결제 내역 조회(페이지네이션: cursor 기반)
router.get("/my", auth.verifyAuth, PaymentsController.getMyPayments);

export default router;
