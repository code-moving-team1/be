import { Router } from "express";
import moverController from "../controllers/mover.controller";

const router = Router();

router.get("/", moverController.getList);

export default router;
