import type { Server, Socket } from "socket.io";

type ChatMessage = {
  id: string;        // socket.id or uuid
  nickname: string;
  text: string;
  ts: number;        // Date.now()
};

const MAX_HISTORY = 50;
const history: ChatMessage[] = [];

function sanitizeNickname(raw?: unknown) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  return s.slice(0, 20); // 길이 제한
}

function sanitizeText(raw?: unknown) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  return s.slice(0, 500);
}

export function initChatNamespace(io: Server) {
  const nsp = io.of("/chat");

  // nickname만 받는 간단 미들웨어 (토큰 필요 없음)
  nsp.use((socket: Socket, next) => {
    const nick = sanitizeNickname((socket.handshake as any).auth?.nickname);
    if (!nick) return next(new Error("NICK_REQUIRED"));
    (socket.data as any).nickname = nick;
    next();
  });

  nsp.on("connection", (socket) => {
    const nickname = (socket.data as any).nickname as string;

    // 접속한 유저에게 최근 히스토리 먼저 전달
    socket.emit("chat:history", history);

    // 모두에게 시스템 메시지 브로드캐스트
    socket.broadcast.emit("chat:system", {
      text: `${nickname} 님이 입장했습니다.`,
      ts: Date.now(),
    });

    // 메시지 수신
    socket.on("chat:message", (payload: { text: string }) => {
      const text = sanitizeText(payload?.text);
      if (!text) return;

      const msg: ChatMessage = {
        id: socket.id,
        nickname,
        text,
        ts: Date.now(),
      };

      history.push(msg);
      if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);

      nsp.emit("chat:message", msg); // 모두에게 전송
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("chat:system", {
        text: `${nickname} 님이 퇴장했습니다.`,
        ts: Date.now(),
      });
    });
  });

  return nsp;
}
