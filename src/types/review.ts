import { Rating } from "./rating";

/**
 * Review 관련 타입 정의
 * rating 필드는 0-5 사이의 정수만 허용
 */

// Review 생성 시 사용할 데이터 타입
export interface CreateReviewInput {
  bookingId: number;
  content: string;
  rating: Rating; // 0-5 사이의 정수만 허용
  customerId: number;
  moverId: number;
  moveRequestId: number;
}

// Review 업데이트 시 사용할 데이터 타입
export interface UpdateReviewInput {
  content?: string;
  rating?: Rating; // 0-5 사이의 정수만 허용
}

// Review 응답 타입
export interface ReviewResponse {
  id: number;
  bookingId: number;
  content: string;
  rating: Rating; // 0-5 사이의 정수만 허용
  customerId: number;
  moverId: number;
  moveRequestId: number;
  createdAt: Date;
  updatedAt: Date;
}

// rating별 통계 타입
export interface RatingStats {
  rating0: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}
