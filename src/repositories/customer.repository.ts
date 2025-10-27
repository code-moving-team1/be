import { prisma } from "../lib/prisma";
import { Prisma, Region, ServiceType, UserPlatform } from "@prisma/client";
import { createError } from "../utils/HttpError";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export type CustomerBasicInfoUpdate = {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  img?: string;
  region?: Region;
  serviceTypes?: ServiceType[];
};

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

export async function updateBasicInfo(data: CustomerBasicInfoUpdate) {
  const {
    id,
    name,
    email,
    phone,
    currentPassword,
    newPassword,
    img,
    region,
    serviceTypes,
  } = data;

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({
      where: { id },
      select: { password: true, email: true, customerServiceTypes: true },
    });

    if (!customer) {
      throw createError("USER/NOT_FOUND");
    }

    // 이메일 변경이 있는 경우
    if (email !== customer.email) {
      try {
        await tx.customer.update({
          where: { id },
          data: { email: email },
        });
      } catch (e) {
        throw createError("AUTH/DUPLICATE", {
          messageOverride: "이미 사용 중인 이메일입니다.",
        });
      }
    }

    // 비밀번호 변경이 있는 경우
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        customer.password
      );
      if (!isPasswordValid) {
        throw createError("AUTH/PASSWORD", {
          messageOverride: "현재 비밀번호가 올바르지 않습니다.",
        });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await tx.customer.update({
        where: { id },
        data: { password: hashedNewPassword },
      });
    }

    // 서비스 타입 업데이트 (있는 경우)
    if (serviceTypes !== undefined) {
      const existingServiceTypes = customer.customerServiceTypes.map(
        (cst) => cst.serviceType
      );
      const serviceTypesToAdd = serviceTypes.filter(
        (serviceType) => !existingServiceTypes.includes(serviceType)
      );
      const serviceTypesToRemove = existingServiceTypes.filter(
        (serviceType) => !serviceTypes.includes(serviceType)
      );

      if (serviceTypesToRemove.length > 0) {
        await tx.customerServiceType.deleteMany({
          where: { customerId: id, serviceType: { in: serviceTypesToRemove } },
        });
      }

      if (serviceTypesToAdd.length > 0) {
        await Promise.all(
          serviceTypesToAdd.map((serviceType) => {
            return tx.customerServiceType.create({
              data: { customerId: id, serviceType },
            });
          })
        );
      }
    }

    const updatedCustomer = await tx.customer.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(img ? { img } : {}),
        ...(region ? { region } : {}),
      },
    });

    return updatedCustomer;
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
  updateBasicInfo,
  update,
  updateLastLoginAt,
  findByRegion,
  findActiveCustomers,
  findByServiceType,
};
