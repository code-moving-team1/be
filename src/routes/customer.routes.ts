import { Router } from "express";
import customerController from "../controllers/customer.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.patch(
  "/profile-setting",
  verifyAuth,
  customerController.updateInitProfile
);
router.patch("/profile-edit", verifyAuth, customerController.updateBasicInfo);

export default router;
