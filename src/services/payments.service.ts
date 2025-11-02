// src/services/payments.service.ts
import axios from "axios";
import { PaymentsRepository } from "../repositories/payments.repository";
import { PointsRepository, type UserType } from "../repositories/points.repository";
import { prisma } from "../lib/prisma";
import { createError } from "../utils/HttpError";

type ConfirmInput = {
  userId: number;
  userType: UserType;
  paymentKey: string;
  orderId: string;
  amount: number;
};

export const PaymentsService = {
  async confirmTossAndChargePoints(input: ConfirmInput) {
    const { paymentKey, orderId, amount, userId, userType } = input;

    // 1) 중복/재승인 방지: 사전 조회
    const existingKey = await PaymentsRepository.findByPaymentKey(paymentKey);
    if (existingKey?.status === "APPROVED") {
      // 이미 승인된 건 → 멱등 반환
      return { ok: true, approved: existingKey };
    }
    const existingOrder = await PaymentsRepository.findByOrderId(orderId);
    if (existingOrder?.status === "APPROVED") {
      return { ok: true, approved: existingOrder };
    }

    // 2) 결제 레코드(초안) 만들어 두기 (unique 충돌 방지)
    const draft = await PaymentsRepository.createOrFailDuplicate({
      provider: "toss",
      paymentKey,
      orderId,
      amount,
      userId,
      userType,
      status: "FAILED",
    });

    // 3) 토스 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      throw createError("SERVER/INTERNAL", { messageOverride: "TOSS_SECRET_KEY is missing" });
    }
    const authHeader = Buffer.from(`${secretKey}:`).toString("base64");

    let approved: any;
    try {
      const { data } = await axios.post(
        "https://api.tosspayments.com/v1/payments/confirm",
        { paymentKey, orderId, amount },
        { headers: { Authorization: `Basic ${authHeader}`, "Content-Type": "application/json" } }
      );
      approved = data;
    } catch (err: any) {
      // 토스 에러를 표면화
      if (err?.response) {
        const { status, data } = err.response;
        const msg = `[TOSS CONFIRM ERROR] ${status} ${data?.message ?? ""} ${data?.code ?? ""}`;
        throw createError("SERVER/INTERNAL", { messageOverride: msg });
      }
      throw err;
    }

    // 4) 포인트 적립 + 결제 완료 마킹 (트랜잭션)
    await prisma.$transaction(async (tx) => {
      // 포인트 적립
      if (userType === "CUSTOMER") {
        await tx.customer.update({
          where: { id: userId },
          data: { points: { increment: amount } },
        });
      } else {
        await tx.mover.update({
          where: { id: userId },
          data: { points: { increment: amount } },
        });
      }
      // 결제 승인 마킹
      await tx.payment.update({
        where: { id: draft.id },
        data: { status: "APPROVED", approvedAt: new Date(), raw: approved },
      });
    });

    return { ok: true, approved };
  },
};
