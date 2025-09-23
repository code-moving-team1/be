// src/services/moveRequest.service.ts
import { createMoveRequest, searchMoveRequests } from "../repositories/moveRequest.repository";
import { CreateMoveRequestInput, SearchMoveRequestsInput } from "../schemas/moveRequest.schema";

export const handleCreateMoveRequest = async (
  customerId: number,
  data: CreateMoveRequestInput
) => {
  return createMoveRequest(customerId, data);
};

//검색해서 그냥 가져오는 로직이라 service가 뭐 없음
export const handleSearchMoveRequests = async (
  filters: SearchMoveRequestsInput
) => {
  return searchMoveRequests(filters);
};