// src/sockets/auth.ts
import type { Socket } from "socket.io";
import jwt from "jsonwebtoken"; // 프로젝트에서 쓰는 검증 유틸 재사용 권장
import type { SocketData } from "./types";
import * as cookie from "cookie";
// import cookie from "cookie";

// 프론트에서 connection시 Authorization: Bearer <token> 헤더 or query.token 로 전달
export function verifySocketAuth(socket: Socket) {
  //1) 쿠키에서 읽기(HttpOnly도 여기로 옴)
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  let token = cookies.accessToken;

  // 2) 헤더 Bearer 또는 query.token 도 허용(있으면 사용)
  const authHeader = socket.handshake.headers["authorization"];
  // let token: string | undefined;
  if (
    !token &&
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ")
  ) {
    token = authHeader.slice("Bearer ".length);
  } else if (typeof socket.handshake.query?.token === "string") {
    token = socket.handshake.query.token;
  }

  if (!token) {
    throw new Error("Unauthorized: token missing");
  }

  // ⚠️ 실제 서비스의 JWT 검증 로직/시크릿 재사용하세요.
  const secret = process.env.JWT_SECRET!;
  const decoded = jwt.verify(token, secret) as any;

  // 팀 구조에 맞춰 아래 필드 맵핑 (예: { sub, role } 등)
  const userType = decoded.userType as "CUSTOMER" | "MOVER";
  const userId = Number(decoded.id);
  if (!userType || !Number.isFinite(userId)) {
    throw new Error("Unauthorized: malformed token");
  }

  // socket.data에 태워두기
  (socket.data as SocketData).userType = userType;
  (socket.data as SocketData).userId = userId;
}
