// src/routes/payments.routes.ts
import { Router } from "express";
import auth from "../middlewares/auth";
import { PaymentsController } from "../controllers/payments.controller";

const router = Router();

// POST /api/payments/toss/confirm
router.post("/toss/confirm", auth.verifyAuth, PaymentsController.confirmToss);

export default router;
