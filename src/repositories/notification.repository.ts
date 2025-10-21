// src/repositories/notification.repository.ts
import { prisma } from "../lib/prisma";
import type { NotificationPriority, NotificationType, Prisma } from "@prisma/client";

export type CreateNotificationParams = {
  userId?: number | null;
  moverId?: number | null;
  type: NotificationType;
  content: string;
  link?: string | null;
  priority?: NotificationPriority;
};

const create = (params: CreateNotificationParams) => {
  const { userId = null, moverId = null, type, content, link=null, priority="MEDIUM" } = params;
  return prisma.notification.create({
    data: {
      userId: userId ?? undefined,
      moverId: moverId ?? undefined,
      type, content, link, priority,
    },
    select: { id: true, type: true, content: true, link: true, createdAt: true },
  });
};

const listForActor = async (
  actor: { userType: "CUSTOMER" | "MOVER"; id: number },
  page=1, pageSize=20
) => {
  const where: Prisma.NotificationWhereInput =
    actor.userType === "CUSTOMER" ? { userId: actor.id } : { moverId: actor.id };

  const [total, rows] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page-1)*pageSize,
      take: pageSize,
      select: { id: true, type: true, content: true, link: true, isRead: true, createdAt: true }
    })
  ]);

  return {
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    data: rows,
  };
};

const countUnread = (actor: { userType: "CUSTOMER" | "MOVER"; id: number }) => {
  const where =
    actor.userType === "CUSTOMER" ? { userId: actor.id, isRead: false } : { moverId: actor.id, isRead: false };
  return prisma.notification.count({ where });
};

const markRead = (id: number, actor: { userType: "CUSTOMER" | "MOVER"; id: number }) => {
  const where =
    actor.userType === "CUSTOMER" ? { id, userId: actor.id } : { id, moverId: actor.id };
  return prisma.notification.update({ where, data: { isRead: true, readAt: new Date() } });
};

const markAllRead = (actor: { userType: "CUSTOMER" | "MOVER"; id: number }) => {
  const where =
    actor.userType === "CUSTOMER" ? { userId: actor.id, isRead: false } : { moverId: actor.id, isRead: false };
  return prisma.notification.updateMany({ where, data: { isRead: true, readAt: new Date() } });
};

export default { create, listForActor, countUnread, markRead, markAllRead };
