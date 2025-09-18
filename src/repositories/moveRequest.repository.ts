// src/repositories/moveRequest.repository.ts
import { prisma } from "../lib/prisma";
import { CreateMoveRequestInput } from "../schemas/moveRequest.schema";

export const createMoveRequest = async (
  customerId: number,
  data: CreateMoveRequestInput
) => {
  return prisma.moveRequest.create({
    data: {
      ...data,
      customerId,
    },
  });
};
