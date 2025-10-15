import { Router } from "express";
import customerController from "../controllers/customer.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.patch(
  "/profile-setting",
  verifyAuth,
  customerController.updateInitProfile
);

export default router;
