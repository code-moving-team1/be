// src/routes/moveRequest.routes.ts

import { Router } from "express";
import moveRequestController from "../controllers/moveRequest.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

// POST
router.post("/", verifyAuth, moveRequestController.createMoveRequestController); // 생성
router.post(
  "/search",
  verifyAuth,
  moveRequestController.searchMoveRequestsController
); // Filtering 검색하여 GET
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
router.get(
  "/customer/mover/:moverId",
  verifyAuth,
  moveRequestController.getListByCustomerWhenDirect
);
router.get("/direct", verifyAuth, moveRequestController.getDirectList);

export default router;
