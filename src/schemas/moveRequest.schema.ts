// src/schemas/moveRequest.schema.ts
import { ServiceType, Region, MoveRequestStatus } from "@prisma/client";
import { z } from "zod";
import { createZodEnum } from "../utils/validation/zodEnumHelper";

// 고객이 일반이사 요청 생성 검사
export const createMoveRequestSchema = z.object({
  serviceType: createZodEnum(ServiceType),
  moveDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "이사 날짜는 오늘 이후여야 합니다.",
  }),
  departure: z.string().min(2, "출발지를 입력해주세요."),
  departureRegion: createZodEnum(Region),
  destination: z.string().min(2, "도착지를 입력해주세요."),
  destinationRegion: createZodEnum(Region),
});

export type CreateMoveRequestInput = z.infer<typeof createMoveRequestSchema>;

//기사가 이사요청목록 불러올때 검사

export const searchMoveRequestsSchema = z.object({
  regions: z.array(createZodEnum(Region)).optional(),
  serviceTypes: z.array(createZodEnum(ServiceType)).optional(),
  departureRegions: z.array(createZodEnum(Region)).optional(),
  destinationRegions: z.array(createZodEnum(Region)).optional(),
  status: z.array(createZodEnum(MoveRequestStatus)).optional(),
  dateFrom: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  dateTo: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  page: z.number().default(1),
  pageSize: z.number().default(10),
  sort: z
    .object({
      field: z.string(),
      order: z.enum(["asc", "desc"]),
    })
    .optional(),
});

export type SearchMoveRequestsInput = z.infer<typeof searchMoveRequestsSchema>;
