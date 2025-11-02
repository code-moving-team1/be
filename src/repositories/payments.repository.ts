// src/repositories/payments.repository.ts
import { prisma } from "../lib/prisma";
import type { UserType } from "./points.repository";

export type PaymentRecord = {
  provider: "toss";
  paymentKey: string;
  orderId: string;
  amount: number;
  userId: number;
  userType: UserType;
  status: "APPROVED" | "FAILED";
  approvedAt?: Date | null;
  raw?: any;
};

export const PaymentsRepository = {
  async findByPaymentKey(paymentKey: string) {
    return prisma.payment.findUnique({ where: { paymentKey } });
  },
  async findByOrderId(orderId: string) {
    return prisma.payment.findUnique({ where: { orderId } });
  },
  async createOrFailDuplicate(rec: PaymentRecord) {
    // 중복되면 Prisma unique constraint 에러 발생 → 서비스에서 잡아서 처리
    return prisma.payment.create({
      data: {
        provider: rec.provider,
        paymentKey: rec.paymentKey,
        orderId: rec.orderId,
        amount: rec.amount,
        userId: rec.userId,
        userType: rec.userType,
        status: rec.status as any,
        approvedAt: rec.approvedAt ?? null,
        raw: rec.raw ?? null,
      },
    });
  },
  async markApproved(id: number, raw: any) {
    return prisma.payment.update({
      where: { id },
      data: { status: "APPROVED", approvedAt: new Date(), raw },
    });
  },

  // ✅ userId 기준 조회 (cursor 기반, 최신순)
  findManyByUserId(params: {
    userId: number;
    limitPlusOne: number;
    cursor?: number;
  }) {
    const { userId, limitPlusOne, cursor } = params;
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      take: limitPlusOne,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
  },
};
