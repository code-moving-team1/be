// src/schemas/review.schema.ts
import { z } from "zod";

export const CreateReviewBodySchema = z.object({
  content: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
});

export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema>;

export const MyReviewQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
    sort: z
      .enum(["recent", "oldest", "rating_desc", "rating_asc"])
      .default("recent"),
  })
  .strict();

export type MyReviewQuery = z.infer<typeof MyReviewQuerySchema>;
