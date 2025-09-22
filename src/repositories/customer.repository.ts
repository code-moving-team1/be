import { prisma } from "../lib/prisma";
import type { Prisma } from "@prisma/client";

export async function findById(id: number) {
  return prisma.customer.findUnique({
    where: {
      id,
    },
  });
}

export async function findByEmail(email: string) {
  return prisma.customer.findUnique({ where: { email } });
}

export async function findSafeById(id: number) {
  return prisma.customer.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      email: true,
      phone: true,
      img: true,
      region: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

export async function create(customer: {
  email: string;
  password: string;
  phone: string;
  region: string;
  img?: string;
}) {
  return prisma.customer.create({
    data: {
      email: customer.email,
      password: customer.password,
      phone: customer.phone,
      region: customer.region as any, // Region enum으로 변환 필요
      ...(customer.img !== undefined ? { img: customer.img } : {}),
    },
  });
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
      region: region as any, // Region enum으로 변환 필요
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

export default {
  findById,
  findByEmail,
  findSafeById,
  create,
  update,
  updateLastLoginAt,
  findByRegion,
  findActiveCustomers,
};
