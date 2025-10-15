import { prisma } from "../lib/prisma";
import { Prisma, Region, ServiceType, UserPlatform } from "@prisma/client";

export async function findById(id: number) {
  return prisma.customer.findUnique({
    where: {
      id,
      deleted: false,
    },
  });
}

export async function findByEmail(email: string) {
  return prisma.customer.findUnique({ where: { email, deleted: false } });
}

export async function findSafeById(id: number) {
  const raw = await prisma.customer.findUnique({
    where: { id: Number(id), deleted: false },
    include: { customerServiceTypes: true },
  });

  return {
    ...raw,
    customerServiceTypes: raw?.customerServiceTypes.map(
      (serviceType) => serviceType.serviceType
    ),
  };
}

export async function create(customer: {
  name: string;
  email: string;
  password: string;
  phone: string;
  userPlatform?: UserPlatform;
  platformId?: string;
  img?: string;
}) {
  const platform =
    customer.userPlatform === "GOOGLE" && customer.platformId
      ? { userPlatform: customer.userPlatform, googleId: customer.platformId }
      : customer.userPlatform === "NAVER" && customer.platformId
      ? { userPlatform: customer.userPlatform, naverId: customer.platformId }
      : customer.userPlatform === "KAKAO" && customer.platformId
      ? { userPlatform: customer.userPlatform, kakaoId: customer.platformId }
      : {};

  const result = await prisma.customer.create({
    data: {
      name: customer.name,
      email: customer.email,
      password: customer.password,
      phone: customer.phone,
      ...platform,
      ...(customer.img !== undefined ? { img: customer.img } : {}),
    },
  });
  return result;
}

export async function updateInitProfile(
  id: number,
  region: Region,
  serviceTypes: ServiceType[],
  img = ""
) {
  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.customer.update({
      where: {
        id,
      },
      data: {
        region,
        hasProfile: true,
        img,
      },
    });
    const serviceTypeResult = await Promise.all(
      serviceTypes.map((serviceType) => {
        return tx.customerServiceType.create({
          data: {
            customerId: result.id,
            serviceType,
          },
        });
      })
    );

    return result;
  });

  return result;
}

export async function update(id: number, data: Prisma.CustomerUpdateInput) {
  return prisma.customer.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateLastLoginAt(id: number) {
  return prisma.customer.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export async function findByRegion(region: string) {
  return prisma.customer.findMany({
    where: {
      region: region as any, // Region enum으로 변환
      isActive: true,
      deleted: false,
    },
  });
}

export async function findActiveCustomers() {
  return prisma.customer.findMany({
    where: {
      isActive: true,
      deleted: false,
    },
  });
}

export async function findByServiceType(serviceType: string) {
  return prisma.customer.findMany({
    where: {
      customerServiceTypes: {
        some: {
          serviceType: serviceType as any, // ServiceType enum으로 변환 필요
        },
      },
      isActive: true,
      deleted: false,
    },
  });
}

export default {
  findById,
  findByEmail,
  findSafeById,
  create,
  updateInitProfile,
  update,
  updateLastLoginAt,
  findByRegion,
  findActiveCustomers,
  findByServiceType,
};
