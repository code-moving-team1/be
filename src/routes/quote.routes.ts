import { Router } from "express";
import { submitQuoteController } from "../controllers/quote.controller";

const router = Router();

router.post("/move-requests/:moveRequestId/quotes", submitQuoteController);

export default router;
