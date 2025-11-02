// src/routes/payments.routes.ts
import { Router } from "express";
import axios from "axios";
import auth from "../middlewares/auth";

const router = Router();

/**
 * 결제 승인 + 포인트 적립
 * body: { paymentKey: string, orderId: string, amount: number }
 */
router.post("/toss/confirm", auth.verifyAuth, async (req: any, res, next) => {
  try {
    const { paymentKey, orderId, amount } = req.body as {
      paymentKey: string;
      orderId: string;
      amount: number;
    };
    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({ message: "invalid params" });
    }

    // 1) 토스 결제 승인 호출
    //    Authorization: Basic base64("{SECRET_KEY}:")
    const secretKey = process.env.TOSS_SECRET_KEY!;
    if (!secretKey) {
      return res
        .status(500)
        .json({ message: "TOSS_SECRET_KEY is missing on server" });
    }
    const authHeader = Buffer.from(`${secretKey}:`).toString("base64");

    const { data: approved } = await axios.post(
      "https://api.tosspayments.com/v1/payments/confirm",
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 2) 포인트 적립 (amount 원 = amount 포인트)
    //    userType에 따라 고객/기사 테이블을 업데이트
    const userId = req.user.id;
    const userType: "CUSTOMER" | "MOVER" = req.user.userType;

    // 예시: Prisma 사용 가정
    // schema에 각 유저에 points(Int, default 0) 존재한다고 가정
    if (userType === "CUSTOMER") {
      await req.prisma.customer.update({
        where: { id: userId },
        data: { points: { increment: amount } },
      });
    } else {
      await req.prisma.mover.update({
        where: { id: userId },
        data: { points: { increment: amount } },
      });
    }

    // (선택) 포인트 거래내역 테이블에 기록

    res.json({ ok: true, approved });
  } catch (err: any) {
    // 토스 응답 그대로 보여주기 (디버그에 중요)
    if (err.response) {
      // 토스가 보낸 원본 에러를 그대로 보여주기
      return res.status(err.response.status || 500).json({
        message: "toss confirm failed",
        toss: err.response.data, // <- code, message, reason 뽑을 수 있음
      });
    }
    next(err);
  }
});

export default router;
