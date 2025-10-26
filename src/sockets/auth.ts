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
  // // ───────────────────────────────────────────────────────────────────────────────
  // // 1) Cookie에서 토큰 시도(마지막 폴백으로도 사용)
  // //    - handshake.headers.cookie는 원문 쿠키 문자열 (예: "a=1; accessToken=xxx; b=2")
  // //    - HttpOnly 쿠키라도 서버(여기)에서는 접근 가능
  // // ───────────────────────────────────────────────────────────────────────────────
  // const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  // let token = cookies.accessToken;

  // // ───────────────────────────────────────────────────────────────────────────────
  // // 2) Authorization 헤더로 덮어쓰기(있다면 우선)
  // //    - 클라에서 socket.io-client 생성 시 헤더를 직접 넣기 어렵기 때문에
  // //      보통은 서버/프록시에서 붙이거나, fetch로 preflight 후 네고한 토큰을 쿼리/쿠키에 전달
  // // ───────────────────────────────────────────────────────────────────────────────
  // const authHeader = socket.handshake.headers["authorization"];

  // if (
  //   !token &&
  //   typeof authHeader === "string" &&
  //   authHeader.startsWith("Bearer ")
  // ) {
  //   token = authHeader.slice("Bearer ".length);
  // }
  // // ───────────────────────────────────────────────────────────────────────────────
  // // 3) query.token로 덮어쓰기(있다면 우선)
  // //    - 소켓 전용 짧은 수명 토큰(예: 5분짜리)을 발급해서 여기로 전달하는 전략도 좋음
  // // ───────────────────────────────────────────────────────────────────────────────
  // else if (typeof socket.handshake.query?.token === "string") {
  //   token = socket.handshake.query.token;
  // }

  // // ───────────────────────────────────────────────────────────────────────────────
  // // 4) 토큰이 최종적으로도 없다면 인증 실패
  // // ───────────────────────────────────────────────────────────────────────────────
  // if (!token) {
  //   // 이 에러는 상위(io.use 미들웨어)에서 캐치되어 연결 거절(connect_error)로 클라에 전달됨
  //   throw new Error("Unauthorized: token missing");
  // }

  // // ───────────────────────────────────────────────────────────────────────────────
  // // 5) 서명 검증
  // //    - 우리 API 서버의 JWT 시크릿/알고리즘과 동일해야 함
  // //    - 유효기간(exp) 만료 시 jsonwebtoken이 에러를 던짐 → 상위에서 connect_error로 전달
  // // ───────────────────────────────────────────────────────────────────────────────
  // const secret = process.env.JWT_SECRET!;
  // const decoded = jwt.verify(token, secret) as any;

  // // ───────────────────────────────────────────────────────────────────────────────
  // // 6) 페이로드에서 우리 서비스가 요구하는 최소 정보 추출
  // //    - 여기서는 userType("CUSTOMER" | "MOVER") + id(숫자)를 계약으로 삼음
  // //    - 토큰 스펙이 변경되면 이 매핑만 맞춰주면 됨 (ex. sub/role/uid 등)
  // // ───────────────────────────────────────────────────────────────────────────────

  // const userType = decoded.userType as "CUSTOMER" | "MOVER";
  // const userId = Number(decoded.id);
  // if (!userType || !Number.isFinite(userId)) {
  //   // 토큰 구조가 예상과 다르면 연결 거절
  //   throw new Error("Unauthorized: malformed token");
  // }

  // // ───────────────────────────────────────────────────────────────────────────────
  // // 7) socket.data에 주입
  // //    - 이후 connection 핸들러에서 socket.data.userType / socket.data.userId로 사용
  // //    - 타입 안전성을 위해 SocketData 타입을 적용
  // // ───────────────────────────────────────────────────────────────────────────────
  // (socket.data as SocketData).userType = userType;
  // (socket.data as SocketData).userId = userId;
}
