import { Router } from "express";
import directQuoteRequestController from "../controllers/directQuoteRequest.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.get(
  "/customer",
  verifyAuth,
  directQuoteRequestController.getListByCustomer
);

router.get(
  "/mover/rejected",
  verifyAuth,
  directQuoteRequestController.getRejectedListByMover
);

router.post("/", verifyAuth, directQuoteRequestController.create);
router.post(
  "/:id/rejected",
  verifyAuth,
  directQuoteRequestController.updateToRejected
);

export default router;
