// src/routes/notification.routes.ts
import { Router } from "express";
import { verifyAuth } from "../middlewares/auth";
import * as notificationSvc from "../services/notification.service";

const router = Router();

// 목록
router.get("/", verifyAuth, async (req, res, next) => {
  try {
    const actor = (req as any).user as { id:number; userType:"CUSTOMER"|"MOVER" };
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const result = await notificationSvc.list({ userType: actor.userType, id: actor.id }, page, pageSize);
    res.json(result);
  } catch (e) { next(e); }
});

// unread count
router.get("/unread-count", verifyAuth, async (req, res, next) => {
  try {
    const actor = (req as any).user as { id:number; userType:"CUSTOMER"|"MOVER" };
    const count = await notificationSvc.countUnread({ userType: actor.userType, id: actor.id });
    res.json({ count });
  } catch (e) { next(e); }
});

// 단건 읽음
router.patch("/:id/read", verifyAuth, async (req, res, next) => {
  try {
    const actor = (req as any).user as { id:number; userType:"CUSTOMER"|"MOVER" };
    const id = Number(req.params.id);
    await notificationSvc.markRead(id, actor);
    res.json({ success: true });
  } catch (e) { next(e); }
});

// 전체 읽음
router.patch("/mark-all-read", verifyAuth, async (req, res, next) => {
  try {
    const actor = (req as any).user as { id:number; userType:"CUSTOMER"|"MOVER" };
    const { count } = await notificationSvc.markAllRead(actor);
    res.json({ updated: count });
  } catch (e) { next(e); }
});

export default router;
