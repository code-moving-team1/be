import { LikesRepository } from "../repositories/likes.repository";
import { createError } from "../utils/HttpError";

export class LikesService {
  // 좋아요 생성
  static async createLike(customerId: number, moverId: number) {
    // 이미 좋아요가 있는지 확인
    const existingLike = await LikesRepository.findByCustomerAndMover(
      customerId,
      moverId
    );

    if (existingLike) {
      throw createError("LIKES/DUPLICATE");
    }

    return await LikesRepository.create(customerId, moverId);
  }

  // 좋아요 삭제
  static async deleteLike(customerId: number, moverId: number) {
    const deleted = await LikesRepository.deleteByCustomerAndMover(
      customerId,
      moverId
    );

    if (!deleted) {
      throw createError("LIKES/NOT_FOUND");
    }

    return { success: true };
  }

  // 고객의 좋아요 목록 조회
  static async getCustomerLikes(customerId: number) {
    return await LikesRepository.findByCustomerId(customerId);
  }

  // 기사의 좋아요 목록 조회
  static async getMoverLikes(moverId: number) {
    return await LikesRepository.findByMoverId(moverId);
  }

  // 특정 고객-기사 조합의 좋아요 상태 확인
  static async checkLikeStatus(customerId: number, moverId: number) {
    const like = await LikesRepository.findByCustomerAndMover(
      customerId,
      moverId
    );

    return {
      isLiked: !!like,
      like,
    };
  }

  // 고객의 좋아요 개수 조회
  static async getCustomerLikeCount(customerId: number) {
    return await LikesRepository.countByCustomerId(customerId);
  }

  // 기사의 좋아요 개수 조회
  static async getMoverLikeCount(moverId: number) {
    return await LikesRepository.countByMoverId(moverId);
  }

  // 좋아요 토글 (있으면 삭제, 없으면 생성)
  static async toggleLike(customerId: number, moverId: number) {
    const existingLike = await LikesRepository.findByCustomerAndMover(
      customerId,
      moverId
    );

    if (existingLike) {
      // 좋아요가 있으면 삭제
      await LikesRepository.deleteByCustomerAndMover(customerId, moverId);
      return { action: "deleted", like: null };
    } else {
      // 좋아요가 없으면 생성
      const newLike = await LikesRepository.create(customerId, moverId);
      return { action: "created", like: newLike };
    }
  }
}
