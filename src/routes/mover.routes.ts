import { Router } from "express";
import moverController from "../controllers/mover.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.get("/:id", moverController.getProfile);
router.get("/", moverController.getList);
router.get("/likes", verifyAuth, moverController.getLikesList);
router.patch("/profile-setting", verifyAuth, moverController.updateInitProfile);

export default router;
