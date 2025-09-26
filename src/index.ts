// src/index.ts
import express, { NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import moveRequestRoutes from "./routes/moveRequest.routes";
import authRoutes from "./routes/auth.routes";
import quoteRoutes from "./routes/quote.routes";
import { createError, HttpError } from "./utils/HttpError";
import type { ErrorRequestHandler } from "express";

const app = express();
app.use(
  cors({
    origin: true, // 모든 origin 허용
    credentials: true, // 쿠키 전송 허용
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

//라우터 등록
app.use("/api/move-requests", moveRequestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/quote", quoteRoutes);

// HttpError 기반 전역 에러 핸들러
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json(err.toJSON());
  }
  const internal = createError("SERVER/INTERNAL");
  console.error(err);
  return res.status(internal.status).json(internal.toJSON());
};

app.use(errorHandler);

//
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
