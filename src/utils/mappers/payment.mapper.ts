// src/utils/mappers/payment.mapper.ts
import { Payment, Prisma } from "@prisma/client";

export type PaymentDTO = {
  id: number;
  amount: number;
  status: Payment["status"];
  approvedAt: Date | null;
  orderId: string;
  method: string | null;
  easyPayProvider: string | null;
  cardType: string | null;
  receiptUrl: string | null;
  createdAt: Date;
};

// JsonValue -> 객체로 안전하게 좁히기
function asObj(
  v: Prisma.JsonValue | null | undefined
): Prisma.JsonObject | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Prisma.JsonObject)
    : null;
}
// 문자열 안전 추출
function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

// 실제 매핑 함수 (서비스에서 이거만 호출)
export function mapPaymentToDTO(p: Payment): PaymentDTO {
  const raw = asObj(p.raw);
  const easyPay = asObj(raw?.["easyPay"]);
  const card = asObj(raw?.["card"]);
  const receipt = asObj(raw?.["receipt"]);

  return {
    id: p.id,
    amount: p.amount,
    status: p.status,
    approvedAt: p.approvedAt,
    orderId: p.orderId,
    method: asStr(raw?.["method"]),
    easyPayProvider: asStr(easyPay?.["provider"]),
    cardType: asStr(card?.["cardType"]),
    receiptUrl: asStr(receipt?.["url"]),
    createdAt: p.createdAt,
  };
}
