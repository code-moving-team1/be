import type { Mover, Customer, UserType } from "@prisma/client";

export type SafeMover = Pick<Mover, "id" | "email" | "phone" | "img" | "nickname" | "career" | "introduction" | "description" | "averageRating" | "totalReviews" | "createdAt">;

export type SafeCustomer = Pick<Customer, "id" | "email" | "createdAt">;