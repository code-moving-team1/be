import { Region, ServiceType } from "@prisma/client";
import moverRepo, {
  MoverInitProfile,
  MoverListFilters,
} from "../repositories/mover.repository";

const getById = async (id: number) => {
  const result = await moverRepo.findById(id);
  return result;
};

const getList = async (filters: MoverListFilters) => {
  const result = await moverRepo.getList(filters);
  return result;
};

const getLikesList = async (customerId: number) => {
  const result = await moverRepo.getLikesList(customerId);
  return result;
};

const getProfile = async (id: number) => {
  const result = await moverRepo.getProfile(id);
  return result;
};

const updateInitProfile = async (data: MoverInitProfile) => {
  const result = await moverRepo.updateInitProfile(data);
  return result;
};

export default {
  getById,
  getList,
  getLikesList,
  getProfile,
  updateInitProfile,
};
