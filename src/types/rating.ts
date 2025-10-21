// Rating 타입 정의 (0-5 사이의 정수만 허용)
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

// Rating 유틸리티 함수들
export const Rating = {
  // rating 값이 유효한지 검증
  isValid: (value: number): value is Rating => {
    return Number.isInteger(value) && value >= 0 && value <= 5;
  },

  // rating 값을 Rating 타입으로 변환 (검증 포함)
  fromNumber: (value: number): Rating => {
    if (!Rating.isValid(value)) {
      throw new Error(
        `Invalid rating: ${value}. Rating must be between 0 and 5.`
      );
    }
    return value as Rating;
  },

  // 모든 가능한 rating 값들
  values: [0, 1, 2, 3, 4, 5] as const,

  // rating을 문자열로 변환
  toString: (rating: Rating): string => {
    const labels = ["0점", "1점", "2점", "3점", "4점", "5점"];
    return labels[rating] || `${rating}점`;
  },

  // rating을 별표로 변환
  toStars: (rating: Rating): string => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  },
} as const;
