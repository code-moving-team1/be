// src/schemas/moveRequest.schema.ts
import { ServiceType } from "@prisma/client";
import { z } from "zod";

export const createMoveRequestSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  moveDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "이사 날짜는 오늘 이후여야 합니다.",
  }),
  departure: z.string().min(2, "출발지를 입력해주세요."),
  destination: z.string().min(2, "도착지를 입력해주세요."),
});

export type CreateMoveRequestInput = z.infer<typeof createMoveRequestSchema>;
