import { Router } from "express";
import { LikesController } from "../controllers/likes.controller";
import { verifyAuth } from "../middlewares/auth";

const router = Router();

// 좋아요 추가
router.post("/", verifyAuth, LikesController.createLike);

// 좋아요 토글 (추가/삭제)
router.post("/toggle", verifyAuth, LikesController.toggleLike);

// 좋아요 삭제
router.delete("/:id", verifyAuth, LikesController.deleteLike);

// 좋아요 일괄 삭제
router.post("/delete-all", verifyAuth, LikesController.deleteAllLikes);

// 고객의 좋아요 목록 조회
router.get("/customer", verifyAuth, LikesController.getCustomerLikes);

// 기사의 좋아요 목록 조회
// router.get("/mover/:moverId", LikesController.getMoverLikes);

// 특정 고객-기사 조합의 좋아요 상태 확인
// router.get("/status/:customerId/:moverId", LikesController.checkLikeStatus);

export default router;
