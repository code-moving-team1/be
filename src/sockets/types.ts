// src/sockets/types.ts
import type { NotificationType } from "@prisma/client";

export type NotificationPayload = {
  id: number;
  type: NotificationType;
  content: string;
  link?: string | null;
  createdAt: string; // ISO
};

export type ServerToClientEvents = {
  "notification:new": (payload: NotificationPayload) => void;
  "notification:unreadCount": (payload: { count: number }) => void;
};

export type ClientToServerEvents = {
  "notification:markRead": (data: { id: number }) => void;
};

export type InterServerEvents = {};

export type SocketData = {
  // 인증 후 주입
  userType: "CUSTOMER" | "MOVER";
  userId: number;
};
