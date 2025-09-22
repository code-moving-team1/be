import {
  ERROR_CATALOG,
  type ErrorCode,
  type MessageTemplate,
} from "./errorCatalog";

export type ErrorDetails = Record<string, unknown>;

export class HttpError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly expose: boolean;
  readonly details?: ErrorDetails;

  constructor(
    code: ErrorCode,
    options?: {
      ctx?: ErrorDetails;
      details?: ErrorDetails;
      messageOverride?: string;
      cause?: unknown;
    }
  ) {
    const entry = ERROR_CATALOG[code];
    const message =
      options?.messageOverride ??
      (typeof entry.message === "function"
        ? (entry.message as (ctx?: Record<string, unknown>) => string)(
            options?.ctx
          )
        : entry.message);

    super(message);
    if (options?.cause !== undefined) {
      (this as any).cause = options.cause;
    }

    this.name = "HttpError";
    this.code = code;
    this.status = entry.status;
    this.expose = entry.expose ?? true;
    if (options?.details !== undefined) {
      this.details = options.details;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details !== undefined ? { details: this.details } : {}),
      },
    };
  }
}

export const createError = (
  code: ErrorCode,
  options?: ConstructorParameters<typeof HttpError>[1]
) => new HttpError(code, options);

export const resolveCatalogMessage = (
  msg: MessageTemplate,
  ctx?: Record<string, unknown>
) =>
  typeof msg === "function"
    ? (msg as (ctx?: Record<string, unknown>) => string)(ctx)
    : msg;

// export type ErrorType =
//   | "email"
//   | "password"
//   | "auth"
//   | "notfound"
//   | "validation";

// export default class HttpError extends Error {
//   status: number;
//   errorType?: ErrorType;

//   constructor(status: number, message: string, errorType?: ErrorType) {
//     super(message);
//     this.status = status;

//     if (errorType !== undefined) {
//       this.errorType = errorType;
//     }

//     Object.setPrototypeOf(this, new.target.prototype);
//     this.name = "HttpError";
//   }
// }
