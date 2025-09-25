import { Router } from "express";
import quoteController, {
  submitQuoteController,
} from "../controllers/quote.controller";

const router = Router();

router.post("/move-requests/:moveRequestId/quotes", submitQuoteController);
router.get("/:moveRequestId", quoteController.getListByRequest);

export default router;
