// src/controllers/payments.controller.ts
import type { Request, Response } from "express";
import { PaymentsService } from "../services/payments.service";
import { createError } from "../utils/HttpError";

export const PaymentsController = {
  confirmToss: async (req: Request, res: Response) => {
    const user = (req as any).user as { id: number; userType: "CUSTOMER" | "MOVER" } | undefined;
    if (!user) throw createError("AUTH/UNAUTHORIZED");

    const { paymentKey, orderId, amount } = req.body ?? {};
    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({ message: "invalid params" });
    }

    const result = await PaymentsService.confirmTossAndChargePoints({
      userId: user.id,
      userType: user.userType,
      paymentKey: String(paymentKey),
      orderId: String(orderId),
      amount: Number(amount),
    });

    return res.json(result);
  },
};
