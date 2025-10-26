import { Router } from "express";
import moverController from "../controllers/mover.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.get("/likes", verifyAuth, moverController.getLikesList);
router.get("/:id", moverController.getProfile);
router.get("/", moverController.getList);
router.patch("/profile-setting", verifyAuth, moverController.updateInitProfile);
router.patch("/profile-edit", verifyAuth, moverController.updateProfile);

export default router;
