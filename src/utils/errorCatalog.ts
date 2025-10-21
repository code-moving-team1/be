// src/utils/errorCatalog.ts
export type ErrorCode =
  | "AUTH/VALIDATION"
  | "AUTH/EMAIL"
  | "AUTH/PASSWORD"
  | "AUTH/UNAUTHORIZED"
  | "AUTH/FORBIDDEN"
  | "AUTH/OAUTH"
  | "AUTH/ACCOUNT_CONFLICT"
  | "USER/NOT_FOUND"
  | "REQUEST/NOT_FOUND"
  | "REQUEST/VALIDATION"
  | "AUTH/DUPLICATE"
  | "QUOTE/DUPLICATE"
  | "SERVER/INTERNAL"
  | "QUOTE/NOT_FOUND"
  | "QUOTE/NOT_PENDING"
  | "QUOTE/FORBIDDEN"
  | "DIRECT/NOT_FOUND"
  | "DIRECT/NOT_PENDING"
  | "DIRECT/PRICE_REQUIRED"
  | "BOOKING/ALREADY_EXISTS"
  | "BOOKING/NOT_FOUND"
  | "BOOKING/NOT_COMPLETED"
  | "REVIEW/DUPLICATE"
  | "REVIEW/FORBIDDEN"
  | "LIKES/DUPLICATE"
  | "LIKES/NOT_FOUND"
  | "LIKES/VALIDATION";

export type MessageTemplate =
  | string
  | ((ctx?: Record<string, unknown>) => string);

type CatalogEntry = {
  status: number;
  message: string | ((ctx?: Record<string, unknown>) => string);
  expose?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
};

export const ERROR_CATALOG = {
  "AUTH/VALIDATION": {
    status: 400,
    message: "필수 항목 누락",
    expose: true,
    logLevel: "warn",
  },
  "AUTH/EMAIL": {
    status: 401,
    message: "이메일이 올바르지 않습니다.",
    expose: true,
    logLevel: "warn",
  },
  "AUTH/PASSWORD": {
    status: 401,
    message: "비밀번호가 올바르지 않습니다.",
    expose: true,
    logLevel: "warn",
  },
  "AUTH/UNAUTHORIZED": {
    status: 401,
    message: "인증이 필요합니다.",
    expose: true,
    logLevel: "info",
  },
  "AUTH/FORBIDDEN": {
    status: 403,
    message: "해당 요청에 대한 권한이 없습니다.",
    expose: true,
    logLevel: "warn",
  },
  "USER/NOT_FOUND": {
    status: 404,
    message: (ctx) =>
      `사용자를 찾을 수 없습니다${ctx?.id ? ` (id: ${ctx.id})` : ""}.`,
    expose: true,
    logLevel: "info",
  },
  "REQUEST/VALIDATION": {
    status: 422,
    message: "요청 값이 유효하지 않습니다.",
    expose: true,
    logLevel: "info",
  },
  "REQUEST/NOT_FOUND": {
    status: 404,
    message: "요청하신 리소스를 찾을 수 없습니다.",
    expose: true,
    logLevel: "info",
  },
  "AUTH/DUPLICATE": {
    status: 409,
    message: "회원가입 항목에 중복 사항이 있습니다.",
    expose: true,
    logLevel: "info",
  },
  "AUTH/OAUTH": {
    status: 500,
    message: "OAuth 인증에 실패했습니다.",
    expose: true,
    logLevel: "error",
  },
  "AUTH/ACCOUNT_CONFLICT": {
    status: 409,
    message:
      "이미 일반 계정으로 가입된 이메일입니다. 간편 로그인을 사용하려면 기존 계정을 삭제하거나 연동해주세요.",
    expose: true,
    logLevel: "warn",
  },
  "QUOTE/DUPLICATE": {
    status: 409,
    message: "이미 동일 유형의 견적을 제출했습니다.",
    expose: true,
    logLevel: "info",
  },
  "SERVER/INTERNAL": {
    status: 500,
    message: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
    expose: false,
    logLevel: "error",
  },

  "QUOTE/NOT_FOUND": {
    status: 404,
    message: "견적을 찾을 수 없습니다.",
    expose: true,
    logLevel: "info",
  },
  "QUOTE/NOT_PENDING": {
    status: 409,
    message: "해당 견적은 확정 가능한 상태가 아닙니다.",
    expose: true,
    logLevel: "info",
  },
  "QUOTE/FORBIDDEN": {
    status: 403,
    message: "해당 견적에 대한 권한이 없습니다.",
    expose: true,
    logLevel: "warn",
  },
  "DIRECT/NOT_FOUND": {
    status: 404,
    message: "지정 견적 요청을 찾을 수 없습니다.",
    expose: true,
    logLevel: "info",
  },
  "DIRECT/NOT_PENDING": {
    status: 409,
    message: "해당 지정 견적 요청은 수락 가능한 상태가 아닙니다.",
    expose: true,
    logLevel: "info",
  },
  "DIRECT/PRICE_REQUIRED": {
    status: 422,
    message: "지정 요청 수락에는 가격이 필요합니다.",
    expose: true,
    logLevel: "info",
  },
  "BOOKING/ALREADY_EXISTS": {
    status: 409,
    message: "이미 해당 요청으로 생성된 예약이 있습니다.",
    expose: true,
    logLevel: "info",
  },
  "BOOKING/NOT_FOUND": {
    status: 404,
    message: "예약을 찾을 수 없습니다.",
    expose: true,
    logLevel: "info",
  },
  "BOOKING/NOT_COMPLETED": {
    status: 409,
    message: "아직 리뷰를 작성할 수 없는 상태의 예약입니다.",
    expose: true,
    logLevel: "info",
  },
  "REVIEW/DUPLICATE": {
    status: 409,
    message: "이미 해당 예약에 대한 리뷰가 존재합니다.",
    expose: true,
    logLevel: "info",
  },
  "REVIEW/FORBIDDEN": {
    status: 403,
    message: "해당 예약에 대한 리뷰 작성 권한이 없습니다.",
    expose: true,
    logLevel: "warn",
  },
  "LIKES/DUPLICATE": {
    status: 409,
    message: "이미 좋아요를 누른 기사입니다.",
    expose: true,
    logLevel: "info",
  },
  "LIKES/NOT_FOUND": {
    status: 404,
    message: "좋아요를 찾을 수 없습니다.",
    expose: true,
    logLevel: "info",
  },
  "LIKES/VALIDATION": {
    status: 400,
    message: "customerId와 moverId는 필수입니다.",
    expose: true,
    logLevel: "warn",
  },
} as const satisfies Record<ErrorCode, CatalogEntry>;
