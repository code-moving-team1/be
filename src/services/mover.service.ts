import moverRepo, { MoverListFilters } from "../repositories/mover.repository";

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

export default {
  getById,
  getList,
  getLikesList,
};
