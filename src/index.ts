import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import moveRequestRoutes from "./routes/moveRequest.routes";
import authRoutes from "./routes/auth.routes";

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

//
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
