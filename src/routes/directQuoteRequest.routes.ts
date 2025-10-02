import { Router } from "express";
import directQuoteRequestController from "../controllers/directQuoteRequest.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.post("/", verifyAuth, directQuoteRequestController.create);
router.post(
  "/:id/rejected",
  verifyAuth,
  directQuoteRequestController.updateToRejected
);

export default router;
