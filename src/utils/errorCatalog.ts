export type ErrorCode =
  | "AUTH/VALIDATION"
  | "AUTH/EMAIL"
  | "AUTH/PASSWORD"
  | "AUTH/UNAUTHORIZED"
  | "USER/NOT_FOUND"
  | "REQUEST/NOT_FOUND"
  | "REQUEST/VALIDATION"
  | "AUTH/DUPLICATE"
  | "QUOTE/DUPLICATE"
  | "SERVER/INTERNAL";

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
} as const satisfies Record<ErrorCode, CatalogEntry>;
