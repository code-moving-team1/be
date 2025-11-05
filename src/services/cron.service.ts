// src/services/cron.service.ts
import bookingRepo from "../repositories/booking.repository";
import moveRequestRepo from "../repositories/moveRequest.repository";

/** KST(UTC+9) '오늘 00:00'을 UTC Date 로 환산 */
function getStartOfTodayInSeoulAsUtc(): Date {
  const nowUtc = new Date();
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

  // 현재 UTC를 KST 로 이동
  const kstNow = new Date(nowUtc.getTime() + KST_OFFSET_MS);
  // KST 기준 오늘 00:00 생성 (주의: Date.UTC 는 항상 UTC 기준)
  const kstStartOfDay = new Date(
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate(), 0, 0, 0, 0)
  );
  // 다시 UTC 타임스탬프로 환산
  return new Date(kstStartOfDay.getTime() - KST_OFFSET_MS);
}


export const completeOverdueBookings = async (graceHours = 6) => {
  // 그레이스 타임(여유시간) 만큼 지난 뒤에 완료 처리 (KST/UTC 혼선 완화)
  // serviceDate가 기준 시각보다 graceHours 만큼 더 과거여야 COMPLETED로 전환
  const cutoff = new Date(Date.now() - graceHours * 60 * 60 * 1000);
  const { count } = await bookingRepo.completeOverdue(cutoff);
  return {
    updated: count,
    cutoff,         // 서버 기준 UTC 시각
    graceHours,
  };
};


/**
 * 오늘(서울시간) 00:00 이전의 moveDate 이고
 * status=ACTIVE && booking=null 인 moveRequest 들을 FINISHED 로 업데이트.
 * preview=true 이면 변경 없이 대상만 반환.
 */
export const finishOverdueMoveRequests = async ({ preview = false }: { preview?: boolean }) => {
  const cutoffUtc = getStartOfTodayInSeoulAsUtc();

  // 1) 대상 조회
  const targets = await moveRequestRepo.findOverdueActiveWithoutBooking(cutoffUtc);

  if (preview || targets.length === 0) {
    return {
      cutoffUtc,
      count: targets.length,
      updated: 0,
      items: targets,
    };
  }

  // 2) 업데이트
  const ids = targets.map((t) => t.id);
  const updateResult = await moveRequestRepo.finishManyByIds(ids);

  // 3) 응답용 재조회
  const updatedItems = await moveRequestRepo.findByIds(ids);

  return {
    cutoffUtc,
    count: targets.length,
    updated: updateResult.count ?? updatedItems.length,
    items: updatedItems,
  };
};