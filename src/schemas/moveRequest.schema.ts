// src/schemas/moveRequest.schema.ts
import { ServiceType, Region } from "@prisma/client";
import { z } from "zod";

export const createMoveRequestSchema = z.object({
  serviceType: z.nativeEnum(ServiceType),
  moveDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "이사 날짜는 오늘 이후여야 합니다.",
  }),
  departure: z.string().min(2, "출발지를 입력해주세요."),
  departureRegion: z.nativeEnum(Region, {
    // errorMap: () => ({ message: "출발 지역은 지정된 ENUM 값이어야 합니다." }),
  }),
  destination: z.string().min(2, "도착지를 입력해주세요."),
  destinationRegion: z.nativeEnum(Region, {
    // errorMap: () => ({ message: "도착 지역은 지정된 ENUM 값이어야 합니다." }), //@우진수정 TODO 나중에 error규격화
  }),
});

export type CreateMoveRequestInput = z.infer<typeof createMoveRequestSchema>;
