import express, { NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./lib/passport";
import moveRequestRoutes from "./routes/moveRequest.routes";
import authRoutes from "./routes/auth.routes";
import quoteRoutes from "./routes/quote.routes";
import moverRoutes from "./routes/mover.routes";
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

// 세션 설정 (Passport OAuth용)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24시간
    },
  })
);

// Passport 미들웨어 설정 (통합)
app.use(passport.initialize());
app.use(passport.session());

//라우터 등록
app.use("/api/move-requests", moveRequestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/mover", moverRoutes);

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
