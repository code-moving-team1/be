// src/routes/moveRequest.routes.ts

import { Router } from "express";
import {
  createMoveRequestController,
  searchMoveRequestsController,
} from "../controllers/moveRequest.controller";

const router = Router();

// POST
router.post("/", createMoveRequestController); // 생성
router.post("/search", searchMoveRequestsController); // Filtering 검색하여 GET

export default router;
