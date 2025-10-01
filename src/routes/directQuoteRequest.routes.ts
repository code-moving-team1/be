import { Router } from "express";
import directQuoteRequestController from "../controllers/directQuoteRequest.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.post("/", verifyAuth, directQuoteRequestController.create);
router.patch("/:id/accept", directQuoteRequestController.updateToAccepted);

export default router;
