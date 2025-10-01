import { prisma } from "../lib/prisma";
import type { DirectRequestStatus, Prisma } from "@prisma/client";

const create = async (moveRequestId: number, moverId: number) => {
  const result = await prisma.directQuoteRequest.create({
    data: {
      moveRequestId,
      moverId,
    },
  });
  return result;
};

const update = async (id: number, status: DirectRequestStatus) => {
  const result = await prisma.directQuoteRequest.update({
    where: { id },
    data: {
      status,
    },
  });
  return result;
};

export default {
  create,
  update,
};
