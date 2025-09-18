import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";



const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중`);
});