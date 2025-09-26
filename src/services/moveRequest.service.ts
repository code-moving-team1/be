// src/services/moveRequest.service.ts
import moveRequestRepo from "../repositories/moveRequest.repository";
import {
  CreateMoveRequestInput,
  SearchMoveRequestsInput,
} from "../schemas/moveRequest.schema";

export const handleCreateMoveRequest = async (
  customerId: number,
  data: CreateMoveRequestInput
) => {
  return await moveRequestRepo.createMoveRequest(customerId, data);
};

//검색해서 그냥 가져오는 로직이라 service가 뭐 없음
export const handleSearchMoveRequests = async (
  filters: SearchMoveRequestsInput
) => {
  return await moveRequestRepo.searchMoveRequests(filters);
};

const getListByCustomer = async (customerId: number, isActive: boolean) => {
  return await moveRequestRepo.getListByCustomer(customerId, isActive);
};

export default {
  handleCreateMoveRequest,
  handleSearchMoveRequests,
  getListByCustomer,
};
