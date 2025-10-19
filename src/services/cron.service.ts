// src/services/cron.service.ts
import bookingRepo from "../repositories/booking.repository";

export const completeOverdueBookings = async (graceHours = 6) => {
  // 그레이스 타임(여유시간) 만큼 지난 뒤에 완료 처리 (KST/UTC 혼선 완화)
  const cutoff = new Date(Date.now() - graceHours * 60 * 60 * 1000);
  const { count } = await bookingRepo.completeOverdue(cutoff);
  return {
    updated: count,
    cutoff,         // 서버 기준 UTC 시각
    graceHours,
  };
};
