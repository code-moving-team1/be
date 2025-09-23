import { prisma } from "../lib/prisma";
import type { Prisma, Region, ServiceType } from "@prisma/client";

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
  email: string;
  password: string;
  phone: string;
  region: string;
  serviceTypes: string[];
  img?: string;
}) {
  const result = await prisma.customer.create({
    data: {
      email: customer.email,
      password: customer.password,
      phone: customer.phone,
      region: customer.region as Region, // Region enum으로 변환
      ...(customer.img !== undefined ? { img: customer.img } : {}),
    },
  });
  const serviceTypeResult = await Promise.all(
    customer.serviceTypes.map((serviceType) => {
      return prisma.customerServiceType.create({
        data: {
          customerId: result.id,
          serviceType: serviceType as ServiceType,
        },
      });
    })
  );

  return {
    ...result,
    customerServiceTypes: serviceTypeResult.map(
      (serviceType) => serviceType.serviceType
    ),
  };
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
  update,
  updateLastLoginAt,
  findByRegion,
  findActiveCustomers,
  findByServiceType,
};
