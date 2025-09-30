import moverRepo from "../repositories/mover.repository";

const getList = async () => {
  const result = await moverRepo.getList();
  return result;
};

export default {
  getList,
};
