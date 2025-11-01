// src/sockets/index.ts
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

// 서버-클라 간 통신 이벤트 타입들(우리 프로젝트 커스텀 타입)
import {
  type ServerToClientEvents, // 서버가 클라이언트에게 보낼 수 있는 이벤트 시그니처
  type ClientToServerEvents, // 클라이언트가 서버에게 보낼 수 있는 이벤트 시그니처
  type InterServerEvents, // 여러 소켓 서버 간 이벤트
  type SocketData, // handshake 이후 socket.data에 올려둘 사용자 정보 타입
} from "./types";
import { verifySocketAuth } from "./auth"; // 소켓 연결 인증 미들웨어
import { customerRoom, moverRoom } from "./rooms"; // 유저/기사 전용 룸 네이밍 유틸
import { bindIo } from "./emitters"; // emitters.ts에서 io 인스턴스 접근 가능하게 바인딩
// (선택) Redis 어댑터 연결 import { createAdapter } from "@socket.io/redis-adapter"; ...
import { initChatNamespace } from "./chat";

/**
 * HTTP 서버 위에 Socket.IO 서버를 얹고, 인증/룸조인/핸들러 등을 설정한다.
 * 앱 최초 부팅 시 한번만 호출되어야 한다.
 */
export const initSocket = (httpServer: HttpServer) => {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    // 프론트에서 소켓을 붙일 때의 CORS 설정
    cors: {
      // 쉼표로 구분된 ORIGIN 목록을 허용. 로컬 기본값은 3000
      // origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
      origin: (process.env.CORS_ORIGIN ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      // 크리덴셜(쿠키 등) 포함 핸드셰이크 허용
      credentials: true,
    },

    // 필요 시 path, transports, pingTimeout 등도 여기서 커스터마이징 가능
    path: "/socket.io",
    // transports: ["websocket", "polling"],
    // pingTimeout: 30000,
  });

  /**
   * [전역 미들웨어] 모든 소켓 연결 handshake 시 1차 통과점.
   * 여기서 JWT를 검증하고 socket.data에 사용자 정보를 싣는다.
   * 실패 시 next(error)로 커넥션 자체를 거절한다.
   */
  io.use((socket, next) => {
    try {
      verifySocketAuth(socket); // 내부에서 토큰 파싱/검증 + socket.data 설정
      console.log("[HS DEBUG]", {
        hasCookie: !!socket.handshake.headers.cookie,
        origin: socket.handshake.headers.origin,
        // authPayload: socket.handshake.auth, // 이제는 비어있을 예정
      });
      next();
    } catch (e: any) {
      console.error("[SOCKET AUTH ERROR]", e?.message); //디버깅용 로그
      next(e); // 인증실패 - 연결 거절
    }
  });

  /**
   * 실제 연결이 성사된 이후 1회 호출되는 콜백.
   * 여기서 개인 룸(join) 등 연결 이후 로직을 구성한다.
   */
  io.on("connection", (socket) => {
    const { userType, userId } = socket.data;
    console.log("[SOCKET CONNECTED]", { userType, userId, id: socket.id });

    // 1) 사용자 타입에 따라 전용 룸에 합류시킨다.
    // - 유저 개인 알림은 "customer:{id}" 또는 "mover:{id}" 룸으로 타깃팅해서 emit
    if (userType === "CUSTOMER") {
      socket.join(customerRoom(userId));
    } else {
      socket.join(moverRoom(userId));
    }

    /**
     * 2) (옵션) 클라이언트가 보낼 수 있는 커스텀 이벤트를 수신한다.
     *    예: 알림 단건 읽음 처리 요청
     *    - 소켓으로 들어온 요청도 서버의 기존 서비스/리포지토리 레이어를 재사용하는 게 규칙성 측면에서 좋다.
     */
    // 클라가 특정 이벤트 보낼 때 처리(옵션)
    socket.on("notification:markRead", async ({ id }) => {
      // 우리는 누르면 그냥 읽음처리 엔드포인트 post합니다
      // 여기서 소유자 검증 + 읽음처리 호출(컨트롤러/서비스 재사용)
      // notificationService.markRead(id, { userType, userId });
      // 그 후 최신 unreadCount emit (선택)
      // const count = await notificationService.countUnread({ userType, userId });
      // io.to(userType === 'CUSTOMER' ? customerRoom(userId) : moverRoom(userId))
      //   .emit("notification:unreadCount", { count });
    });

    /**
     * 3) 연결 해제 시 후처리(로깅/정리)를 한다.
     *    - 필요시 여기서 presence(온라인/오프라인) 관리도 가능
     */
    socket.on("disconnect", (reason) => {
      // 로그/정리(필요시)
      console.log("[SOCKET DISCONNECT]", socket.id, reason);
    });
  });

  /**
   * emitters.ts에서 서버 어디서든 io 인스턴스를 안전하게 참조할 수 있도록 바인딩한다.
   * - 알림 생성 서비스 로직에서 io에 접근해 개별 룸으로 emit하기 위함
   * - 바인딩 실패/중복을 방지하기 위해 앱 부팅 시점에 1회만 호출
   */
  bindIo(io);
  initChatNamespace(io); //공개채팅 네임스페이스 활성화

  return io;
};
