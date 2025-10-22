// src/services/notification.service.ts
import repo from "../repositories/notification.repository";
import type { NotificationType, NotificationPriority } from "@prisma/client";
import { emitToCustomer, emitToMover } from "../sockets/emitters";

export const notifyCustomer = async (userId: number, params: {
  type: NotificationType; content: string; link?: string | null; priority?: NotificationPriority;
}) => {
  const row = await repo.create({ userId, ...params });

  console.log("[NOTI CREATE][CUSTOMER]", userId, row.id); // ✅
  // 실시간 push (소켓 없는 경우에도 안전하게 무시)
  emitToCustomer(userId, {
    id: row.id,
    type: row.type,
    content: row.content,
    link: row.link,
    createdAt: row.createdAt.toISOString(),
  });
  return row;
};

export const notifyMover = async (moverId: number, params: {
  type: NotificationType; content: string; link?: string | null; priority?: NotificationPriority;
}) => {
  const row = await repo.create({ moverId, ...params });
  console.log("[NOTI CREATE][MOVER]", moverId, row.id); // ✅
  emitToMover(moverId, {
    id: row.id,
    type: row.type,
    content: row.content,
    link: row.link,
    createdAt: row.createdAt.toISOString(),
  });
  return row;
};

export const list = repo.listForActor;
export const countUnread = repo.countUnread;
export const markRead = repo.markRead;
export const markAllRead = repo.markAllRead;
