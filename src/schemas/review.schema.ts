// src/schemas/review.schema.ts
import { z } from "zod";

export const CreateReviewBodySchema = z.object({
  content: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5),
});

export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema>;
