// src/sockets/emitters.ts

/**
 * "서버 어느 위치(서비스/컨트롤러 등)에서든"
 * Socket.IO 인스턴스(io)에 접근해 특정 사용자 룸으로 이벤트를 내보내기 위한 유틸.
 *
 * 구조 요약:
 *   - bindIo(io): 앱 부팅 시점에 단 한 번 호출해, 내부 모듈 전역(ioRef)에 io를 바인딩
 *   - emitToCustomer/emitToMover: 개인 룸으로 알림 이벤트 발송
 *
 * 왜 이렇게 분리하나?
 *   - 서비스 계층(notification.service 등)은 Socket.IO를 몰라도 되게(의존성 역전)
 *   - 테스트/모킹이 쉬움 (emit 함수를 스파이/모킹 가능)
 *   - 멀티 파일/모듈에서 동일한 io 인스턴스를 공유
 */
import type { Server } from "socket.io";
import { customerRoom, moverRoom } from "./rooms";
import type { NotificationPayload } from "./types";

// 앱 전역에서 참조할 Socket.IO 인스턴스의 저장소(싱글턴)
// - initSocket(...)에서 bindIo(io)로 주입되며, 그 전엔 null
let ioRef: Server | null = null;
/**
 * 앱 부팅 시점에 반드시 1회 호출하여 Socket.IO 인스턴스를 바인딩한다.
 * - 같은 프로세스 내에서 소켓 서버가 1개일 것을 전제(일반적인 구성)
 * - 멀티 인스턴스(수평 확장) 환경에서는 Redis 어댑터를 통해 cross-node 전달을 보장해야 한다.
 */
export const bindIo = (io: Server) => {
  ioRef = io;
  console.log("[SOCKET IO BOUND]"); // ✅ 바인딩 확인
};

/**
 * 고객 전용 룸으로 알림 이벤트를 발송한다.
 * - 룸 네이밍 규칙: customer:{id}
 * - 이벤트 이름: "notification:new"
 *   (클라이언트 훅 useNotifications에서 해당 이벤트를 구독하고 UI 상태를 갱신)
 *
 * 주의:
 * - initSocket에서 bindIo가 먼저 호출되지 않았다면 emit 시점에 예외를 던진다.
 * - 멀티 인스턴스 환경에서는 Redis 어댑터를 붙여야 다른 노드의 연결에도 메시지가 전달된다.
 */
export const emitToCustomer = (
  customerId: number,
  payload: NotificationPayload
) => {
  if (!ioRef) throw new Error("Socket.IO not bound yet");
  ioRef.to(customerRoom(customerId)).emit("notification:new", payload);
};

/**
 * 기사 전용 룸으로 알림 이벤트를 발송한다.
 * - 룸 네이밍 규칙: mover:{id}
 * - 이벤트 이름: "notification:new" (고객과 동일 이벤트명, 페이로드 스키마도 동일)
 *
 * 확장 포인트:
 * - 필요 시 우선순위/타입에 따라 이벤트명을 분리("notification:priority", "notification:system" 등)
 * - 또는 네임스페이스(/realtime 등)로 논리적 분리도 가능
 */
export const emitToMover = (moverId: number, payload: NotificationPayload) => {
  if (!ioRef) throw new Error("Socket.IO not bound yet");
  ioRef.to(moverRoom(moverId)).emit("notification:new", payload);
};
