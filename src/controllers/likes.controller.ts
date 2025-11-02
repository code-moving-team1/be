import { Request, Response } from "express";
import { LikesService } from "../services/likes.service";
import { createError } from "../utils/HttpError";

export class LikesController {
  // 좋아요 추가
  static async createLike(req: Request, res: Response) {
    const { moverId } = req.body;
    const customerId = (req as any).user.id;
    const { userType } = (req as any).user;

    if (userType !== "CUSTOMER") {
      throw createError("AUTH/FORBIDDEN", {
        messageOverride: "고객 회원만 좋아요를 추가할 수 있습니다.",
      });
    }

    if (!customerId || !moverId) {
      throw createError("LIKES/VALIDATION");
    }

    const like = await LikesService.createLike(customerId, moverId);

    res.status(201).json({
      success: true,
      message: "좋아요가 추가되었습니다.",
      data: like,
    });
  }

  // 좋아요 삭제
  static async deleteLike(req: Request, res: Response) {
    const { moverId } = req.params;
    const customerId = (req as any).user.id;
    const { userType } = (req as any).user;

    if (userType !== "CUSTOMER") {
      throw createError("AUTH/FORBIDDEN", {
        messageOverride: "고객 회원만 좋아요를 삭제할 수 있습니다.",
      });
    }

    if (!customerId || !moverId) {
      throw createError("LIKES/VALIDATION");
    }

    await LikesService.deleteLike(parseInt(customerId), parseInt(moverId));

    res.status(200).json({
      success: true,
      message: "좋아요가 삭제되었습니다.",
    });
  }

  // 좋아요 일괄 삭제
  static async deleteAllLikes(req: Request, res: Response) {
    const { likeIds } = req.body;
    const customerId = (req as any).user.id;
    const { userType } = (req as any).user;

    if (userType !== "CUSTOMER") {
      throw createError("AUTH/FORBIDDEN", {
        messageOverride: "고객 회원만 좋아요를 일괄 삭제할 수 있습니다.",
      });
    }

    await LikesService.deleteAllLikes(likeIds, customerId);

    res.status(200).json({
      success: true,
      message: "좋아요가 일괄 삭제되었습니다.",
    });
  }

  // 고객의 좋아요 목록 조회
  static async getCustomerLikes(req: Request, res: Response) {
    const customerId = (req as any).user.id;
    const { userType } = (req as any).user;

    if (userType !== "CUSTOMER") {
      throw createError("AUTH/FORBIDDEN", {
        messageOverride: "고객 회원만 좋아요 목록을 조회할 수 있습니다.",
      });
    }

    if (!customerId) {
      throw createError("LIKES/VALIDATION");
    }

    const likes = await LikesService.getCustomerLikes(parseInt(customerId));

    res.status(200).json({
      success: true,
      data: likes,
    });
  }

  // 기사의 좋아요 갯수 조회
  static async getMoverLikeCount(req: Request, res: Response) {
    const { moverId } = req.params;

    if (!moverId) {
      throw createError("LIKES/VALIDATION");
    }

    const likesCount = await LikesService.getMoverLikeCount(parseInt(moverId));

    res.status(200).json(likesCount);
  }

  // 특정 고객-기사 조합의 좋아요 상태 확인
  static async checkLikeStatus(req: Request, res: Response) {
    const customerId = (req as any).user.id;
    const { moverId } = req.params;

    const { userType } = (req as any).user;

    if (userType !== "CUSTOMER") {
      throw createError("AUTH/FORBIDDEN", {
        messageOverride: "고객 회원만 좋아요 상태를 확인할 수 있습니다.",
      });
    }

    if (!customerId || !moverId) {
      throw createError("LIKES/VALIDATION");
    }

    const result = await LikesService.checkLikeStatus(
      parseInt(customerId),
      parseInt(moverId)
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // 좋아요 토글 (있으면 삭제, 없으면 생성)
  static async toggleLike(req: Request, res: Response) {
    const customerId = (req as any).user.id;
    const { moverId } = req.body;

    const { userType } = (req as any).user;

    if (userType !== "CUSTOMER") {
      throw createError("AUTH/FORBIDDEN", {
        messageOverride: "고객 회원만 좋아요 토글을 할 수 있습니다.",
      });
    }

    if (!customerId || !moverId) {
      throw createError("LIKES/VALIDATION");
    }

    const result = await LikesService.toggleLike(customerId, moverId);

    res.status(200).json({
      success: true,
      message: `좋아요가 ${
        result.action === "created" ? "추가" : "삭제"
      }되었습니다.`,
      data: result,
    });
  }
}
