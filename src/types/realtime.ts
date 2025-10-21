// // src/types/realtime.ts
// export type ServerToClient = {
//   "notif:new": {
//     id: number;
//     content: string;
//     type: "NEW_QUOTE_RECEIVED" | "MOVE_REQUEST_DECIDED" | "D_DAY_ALARM" | "DIRECT_QUOTE_REQ_DENIED" | "QUOTE_ACCEPTED" | "QUOTE_REJECTED" | "REVIEW_RECEIVED" | "ETC";
//     link?: string | null;
//     createdAt: string;
//   };
//   "chat:receive": {
//     roomId: string;
//     messageId: string;
//     senderType: "CUSTOMER" | "MOVER";
//     senderId: number;
//     text: string;
//     createdAt: string;
//   };
// };

// export type ClientToServer = {
//   "notif:ack": { ids: number[] }; // 읽음 처리 등 필요 시
//   "chat:send": { roomId: string; text: string };
//   "chat:join": { roomId: string };
//   "chat:leave": { roomId: string };
// };

// export type InterServerEvents = {};
// export type SocketData = {
//   userId: number;
//   userType: "CUSTOMER" | "MOVER";
// };
