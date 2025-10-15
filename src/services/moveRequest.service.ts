// src/services/moveRequest.service.ts
import { MoveRequestStatus } from "@prisma/client";
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
  filters: SearchMoveRequestsInput,
  moverId?: number
) => {
  return await moveRequestRepo.searchMoveRequests(filters, moverId);
};

const getListByCustomer = async (customerId: number, isActive: boolean) => {
  const where = isActive
    ? { customerId, status: MoveRequestStatus.ACTIVE }
    : {
        customerId,
        status: {
          in: [MoveRequestStatus.COMPLETED, MoveRequestStatus.FINISHED],
        },
      };
  return prisma?.moveRequest.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });
};

const getById = async (id: number) => {
  return await moveRequestRepo.getMoveRequestById(id);
};

const getListByCustomerWhenDirect = async (
  customerId: number,
  moverId: number,
  page: number
) => {
  return await moveRequestRepo.getListByCustomerWhenDirect(
    customerId,
    moverId,
    page
  );
};

const getDirectList = async (
  moverId: number,
  sort: string = "move-date",
  page: number = 1,
  pageSize: number = 5
) => {
  return await moveRequestRepo.getDirectList(moverId, sort, page, pageSize);
};

export default {
  handleCreateMoveRequest,
  handleSearchMoveRequests,
  getListByCustomer,
  getById,
  getListByCustomerWhenDirect,
  getDirectList,
};
