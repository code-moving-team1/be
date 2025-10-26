import { Region, ServiceType } from "@prisma/client";
import customerRepo, {
  CustomerBasicInfoUpdate,
} from "../repositories/customer.repository";

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

const updateBasicInfo = async (data: CustomerBasicInfoUpdate) => {
  const result = await customerRepo.updateBasicInfo(data);
  return result;
};

export default {
  updateInitProfile,
  updateBasicInfo,
};
