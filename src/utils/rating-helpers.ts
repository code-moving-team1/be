import { Rating } from "../types/rating";

/**
 * Review의 rating 필드에 대한 타입 안전한 헬퍼 함수들
 */

/**
 * rating 값이 유효한지 검증하고 Rating 타입으로 변환
 * @param value - 검증할 rating 값
 * @returns Rating 타입 (0-5 사이의 정수)
 * @throws Error - 유효하지 않은 rating 값인 경우
 */
export function validateAndConvertRating(value: number): Rating {
  if (!Number.isInteger(value)) {
    throw new Error(`Rating must be an integer, got: ${value}`);
  }

  if (value < 0 || value > 5) {
    throw new Error(`Rating must be between 0 and 5, got: ${value}`);
  }

  return value as Rating;
}

/**
 * rating 배열을 안전하게 처리
 * @param ratings - rating 값들의 배열
 * @returns 유효한 Rating 값들만 포함된 배열
 */
export function filterValidRatings(ratings: number[]): Rating[] {
  return ratings
    .filter(Number.isInteger)
    .filter((rating) => rating >= 0 && rating <= 5)
    .map((rating) => rating as Rating);
}

/**
 * rating별 개수를 집계
 * @param ratings - rating 값들의 배열
 * @returns rating별 개수 객체
 */
export function countRatings(ratings: Rating[]): Record<string, number> {
  const counts = {
    rating0: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0,
  };

  ratings.forEach((rating) => {
    counts[`rating${rating}` as keyof typeof counts]++;
  });

  return counts;
}
