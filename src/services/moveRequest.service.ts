// src/services/moveRequest.service.ts
import { createMoveRequest } from "../repositories/moveRequest.repository";
import { CreateMoveRequestInput } from "../schemas/moveRequest.schema";

export const handleCreateMoveRequest = async (
  customerId: number,
  data: CreateMoveRequestInput
) => {
  return createMoveRequest(customerId, data);
};
