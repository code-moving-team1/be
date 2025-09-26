// src/routes/moveRequest.routes.ts

import { Router } from "express";
import moveRequestController from "../controllers/moveRequest.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

// POST
router.post("/", moveRequestController.createMoveRequestController); // 생성
router.post("/search", moveRequestController.searchMoveRequestsController); // Filtering 검색하여 GET
router.get(
  "/customer/active",
  verifyAuth,
  moveRequestController.getActiveListByCustomer
);
router.get(
  "/customer/closed",
  verifyAuth,
  moveRequestController.getClosedListByCustomer
);

export default router;
