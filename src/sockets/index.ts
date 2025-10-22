// src/sockets/index.ts
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import {
  type ServerToClientEvents,
  type ClientToServerEvents,
  type InterServerEvents,
  type SocketData,
} from "./types";
import { verifySocketAuth } from "./auth";
import { customerRoom, moverRoom } from "./rooms";
import { bindIo } from "./emitters";
// (선택) Redis 어댑터 연결 import { createAdapter } from "@socket.io/redis-adapter"; ...

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      verifySocketAuth(socket);
      next();
    } catch (e: any) {
      console.error("[SOCKET AUTH ERROR]", e?.message);
      next(e);
    }
  });

  io.on("connection", (socket) => {
    const { userType, userId } = socket.data;
    console.log("[SOCKET CONNECTED]", { userType, userId, id: socket.id });
    // 룸 조인
    if (userType === "CUSTOMER") {
      socket.join(customerRoom(userId));
    } else {
      socket.join(moverRoom(userId));
    }

    // 클라가 특정 이벤트 보낼 때 처리(옵션)
    socket.on("notification:markRead", async ({ id }) => {
      // 여기서 소유자 검증 + 읽음처리 호출(컨트롤러/서비스 재사용)
      // notificationService.markRead(id, { userType, userId });
      // 그 후 최신 unreadCount emit (선택)
      // const count = await notificationService.countUnread({ userType, userId });
      // io.to(userType === 'CUSTOMER' ? customerRoom(userId) : moverRoom(userId))
      //   .emit("notification:unreadCount", { count });
    });

    socket.on("disconnect", (reason) => {
      // 로그/정리(필요시)
      console.log("[SOCKET DISCONNECT]", socket.id, reason);
    });
  });

  bindIo(io);

  return io;
};
