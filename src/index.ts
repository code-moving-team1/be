import express from "express";
import cors from "cors";
import morgan from "morgan";
import moveRequestRoutes from "./routes/moveRequest.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//라우터 등록

app.use("/api/move-requests", moveRequestRoutes);


//
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});
