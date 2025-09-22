import { prisma } from "../lib/prisma";
import type { Prisma } from "@prisma/client";

export async function findById(id: number) {
  return prisma.mover.findUnique({
    where: {
      id,
    },
  });
}

export async function findByEmail(email: string) {
  return prisma.mover.findUnique({ where: { email } });
}

export async function findByNickname(nickname: string) {
  return prisma.mover.findFirst({ where: { nickname } });
}

export async function findSafeById(id: number) {
  return prisma.mover.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      email: true,
      phone: true,
      img: true,
      nickname: true,
      career: true,
      introduction: true,
      description: true,
      averageRating: true,
      totalReviews: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

export async function create(mover: {
  email: string;
  password: string;
  phone: string;
  nickname: string;
  career: string;
  introduction: string;
  description: string;
  img?: string;
}) {
  return prisma.mover.create({
    data: {
      email: mover.email,
      password: mover.password,
      phone: mover.phone,
      nickname: mover.nickname,
      career: mover.career,
      introduction: mover.introduction,
      description: mover.description,
      ...(mover.img !== undefined ? { img: mover.img } : {}),
    },
  });
}


export async function update(id: number, data: Prisma.MoverUpdateInput) {
  return prisma.mover.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateLastLoginAt(id: number) {
  return prisma.mover.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export async function findByRegion(region: string) {
  return prisma.mover.findMany({
    where: {
      moverRegions: {
        some: {
          region: region as any, // Region enum으로 변환 필요
        },
      },
      isActive: true,
      deleted: false,
    },
  });
}

export async function findActiveMovers() {
  return prisma.mover.findMany({
    where: {
      isActive: true,
      deleted: false,
    },
  });
}

export async function findByServiceType(serviceType: string) {
  return prisma.mover.findMany({
    where: {
      moverServiceTypes: {
        some: {
          serviceType: serviceType as any, // ServiceType enum으로 변환 필요
        },
      },
      isActive: true,
      deleted: false,
    },
  });
}

export async function findByRating(minRating: number) {
  return prisma.mover.findMany({
    where: {
      averageRating: {
        gte: minRating,
      },
      isActive: true,
      deleted: false,
    },
    orderBy: {
      averageRating: "desc",
    },
  });
}

export default {
  findById,
  findByEmail,
  findByNickname,
  findSafeById,
  create,
  update,
  updateLastLoginAt,
  findByRegion,
  findActiveMovers,
  findByServiceType,
  findByRating,
};
