import { z } from "zod";

export const QuoteTypeEnum = z.enum(["NORMAL", "DIRECT"]);

export const SubmitQuoteBodySchema = z.object({
  price: z.number().int().positive().max(1_000_000_000),
  comment: z.string().max(1000).optional().default(""),
  type: QuoteTypeEnum.default("NORMAL"),
});

export type SubmitQuoteBody = z.infer<typeof SubmitQuoteBodySchema>;
