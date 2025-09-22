export type ErrorType =
  | "email"
  | "password"
  | "auth"
  | "notfound"
  | "validation";

export default class HttpError extends Error {
  status: number;
  errorType?: ErrorType;

  constructor(status: number, message: string, errorType?: ErrorType) {
    super(message);
    this.status = status;

    if (errorType !== undefined) {
      this.errorType = errorType;
    }

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "HttpError";
  }
}
