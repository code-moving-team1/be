import { Region, ServiceType } from "@prisma/client";
import moverRepo, {
  MoverInitProfile,
  MoverProfileUpdate,
  MoverBasicInfoUpdate,
  MoverListFilters,
} from "../repositories/mover.repository";
import { LikesRepository } from "../repositories/likes.repository";

const getById = async (id: number) => {
  const result = await moverRepo.findById(id);
  return result;
};

const getList = async (filters: MoverListFilters) => {
  const result = await moverRepo.getList(filters);
  return result;
};

const getLikesList = async (customerId: number) => {
  const result = await LikesRepository.findRecent3ByCustomerId(customerId);
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

const updateProfile = async (data: MoverProfileUpdate) => {
  const result = await moverRepo.updateProfile(data);
  return result;
};

const updateBasicInfo = async (data: MoverBasicInfoUpdate) => {
  const result = await moverRepo.updateBasicInfo(data);
  return result;
};

export default {
  getById,
  getList,
  getLikesList,
  getProfile,
  updateInitProfile,
  updateProfile,
  updateBasicInfo,
};
