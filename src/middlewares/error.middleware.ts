import type { ErrorRequestHandler } from "express";
import { HttpError, resolveCatalogMessage } from "../utils/HttpError";
import { ERROR_CATALOG } from "../utils/errorCatalog";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const httpErr =
    err instanceof HttpError
      ? err
      : new HttpError("SERVER/INTERNAL", {
          cause: err,
          ...(process.env.NODE_ENV === "development"
            ? { details: { origin: String(err) } }
            : {}),
        });

  const entry = ERROR_CATALOG[httpErr.code];

  const clientMessage = entry.expose
    ? httpErr.message
    : resolveCatalogMessage(ERROR_CATALOG["SERVER/INTERNAL"].message);

  const log = console;
  const level = entry.logLevel ?? "error";
  log[level]?.(`[${httpErr.code}] ${httpErr.message}`, {
    status: httpErr.status,
    details: httpErr.details,
    cause: (httpErr as any).cause,
  });

  res.status(httpErr.status).json({
    error: {
      code: httpErr.code,
      message: clientMessage,
      ...(httpErr.details !== undefined ? { details: httpErr.details } : {}),
    },
  });
};
