// src/routes/moveRequest.routes.ts

import { Router } from "express";
import { createMoveRequestController } from "../controllers/moveRequest.controller";

const router = Router();

// POST
router.post('/',createMoveRequestController);

export default router;