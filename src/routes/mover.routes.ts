import { Router } from "express";
import moverController from "../controllers/mover.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

router.get("/", moverController.getList);
router.get("/likes", verifyAuth, moverController.getLikesList);
export default router;
