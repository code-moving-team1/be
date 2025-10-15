// src/routes/auth.routes.ts
import { Router } from "express";
import {
  moverAuthController,
  customerAuthController,
} from "../controllers/auth.controller";

const authRoutes = Router();

// /api/auth/mover로 오는 요청들을 moverController로 전달
authRoutes.use("/mover", moverAuthController);

// /api/auth/customer로 오는 요청들을 customerController로 전달
authRoutes.use("/customer", customerAuthController);

export default authRoutes;
