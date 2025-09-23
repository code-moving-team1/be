import { Router } from "express";
import {
  moverController,
  customerController,
} from "../controllers/auth.controller";

const authRoutes = Router();

// /api/auth/mover로 오는 요청들을 moverController로 전달
authRoutes.use("/mover", moverController);

// /api/auth/customer로 오는 요청들을 customerController로 전달
authRoutes.use("/customer", customerController);

export default authRoutes;
