// src/sockets/auth.ts
import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { SocketData } from "./types";
import * as cookie from "cookie";
// import cookie from "cookie";

/**
 * verifySocketAuth
 * - Socket.IO 핸드셰이크(handshake) 시 1회 호출되어 클라이언트의 인증을 수행한다.
 * - 성공 시 socket.data에 현재 사용자 정보를 주입하고, 실패 시 에러를 던져 연결을 거절한다.
 *
 * 토큰 공급 우선순위(여러 배포/프록시 환경을 모두 포용):
 *   1) (권장) Authorization: Bearer <token>  헤더
 *   2) query.token                                (웹소켓 URL 쿼리)
 *   3) Cookie: accessToken=<token>                (SameSite/도메인 설정 필요)
 *
 * 왜 이런 우선순위인가?
 * - 헤더/쿼리는 프록시/서브도메인/크리덴셜 정책의 영향을 덜 받음 → 실패 가능성 낮음
 * - 쿠키는 환경 설정(SameSite, Secure, 도메인)에 민감 → 마지막 폴백으로 둠
 */

// 프론트에서 connection시 Authorization: Bearer <token> 헤더 or query.token 로 전달
export function verifySocketAuth(socket: Socket) {
  let token: string | undefined;
  const rawCookie = socket.handshake.headers.cookie;
  if (!rawCookie) {
    console.warn("[SOCKET] no cookie in handshake");
  } else {
    console.log("[SOCKET] cookie present");
  }

  // 1) socket.handshake.auth.token (프론트가 넣은 표준 위치)
  if (typeof socket.handshake.auth?.token === "string") {
    token = socket.handshake.auth.token;
  }

  // 2) Authorization 헤더 (브라우저 WS에선 보통 불가, 프록시가 붙여줄 때만 유효)
  if (!token) {
    const authHeader = socket.handshake.headers["authorization"];
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice("Bearer ".length).trim();
    }
  }

  // 3) query.token (레거시/대안)
  if (!token && typeof socket.handshake.query?.token === "string") {
    token = socket.handshake.query.token as string;
  }

  // 4) Cookie (마지막 폴백)
  if (!token) {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    token = cookies.accessToken;
  }

  if (!token) throw new Error("Unauthorized: token missing");

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  const userType = decoded.userType as "CUSTOMER" | "MOVER";
  const userId = Number(decoded.id);
  if (!userType || !Number.isFinite(userId)) {
    throw new Error("Unauthorized: malformed token");
  }

  (socket.data as SocketData).userType = userType;
  (socket.data as SocketData).userId = userId;
}
