import { Router } from "express";
import quoteController from "../controllers/quote.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.post("/:moveRequestId", verifyAuth, quoteController.submit);
router.get("/:moveRequestId", quoteController.getListByRequest);

export default router;
