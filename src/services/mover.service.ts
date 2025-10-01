import moverRepo, { MoverListFilters } from "../repositories/mover.repository";

const getList = async (filters: MoverListFilters) => {
  const result = await moverRepo.getList(filters);
  return result;
};

const getLikesList = async (customerId: number) => {
  const result = await moverRepo.getLikesList(customerId);
  return result;
};

export default {
  getList,
  getLikesList,
};
