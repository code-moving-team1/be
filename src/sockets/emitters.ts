// src/sockets/emitters.ts
import type { Server } from "socket.io";
import { customerRoom, moverRoom } from "./rooms";
import type { NotificationPayload } from "./types";

// io 인스턴스를 어딘가에서 가져올 수 있게 하는 유틸
// (index.ts에서 app.set("io", io) 했다면 getIo(app) 같은 접근자로도 가능)
let ioRef: Server | null = null;

export const bindIo = (io: Server) => {
  ioRef = io;
};

export const emitToCustomer = (customerId: number, payload: NotificationPayload) => {
  if (!ioRef) return;
  ioRef.to(customerRoom(customerId)).emit("notification:new", payload);
};

export const emitToMover = (moverId: number, payload: NotificationPayload) => {
  if (!ioRef) return;
  ioRef.to(moverRoom(moverId)).emit("notification:new", payload);
};
