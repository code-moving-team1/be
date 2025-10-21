import { Prisma } from "@prisma/client";
import { Rating } from "./rating";

// Prisma의 Review 모델을 확장하여 rating 필드에 타입 제약 추가
export type ReviewWithTypedRating = Omit<
  Prisma.ReviewGetPayload<{}>,
  "rating"
> & {
  rating: Rating;
};

// Review 생성 시 사용할 타입
export type CreateReviewData = Omit<Prisma.ReviewCreateInput, "rating"> & {
  rating: Rating;
};

// Review 업데이트 시 사용할 타입
export type UpdateReviewData = Omit<Prisma.ReviewUpdateInput, "rating"> & {
  rating?: Rating;
};
