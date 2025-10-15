import { Region, ServiceType } from "@prisma/client";
import customerRepo from "../repositories/customer.repository";

const updateInitProfile = async (
  id: number,
  region: Region,
  serviceTypes: ServiceType[],
  img = ""
) => {
  const result = await customerRepo.updateInitProfile(
    id,
    region,
    serviceTypes,
    img
  );
  return result;
};

export default {
  updateInitProfile,
};
