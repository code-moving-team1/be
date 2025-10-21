// src/constants/notification.links.ts

export const notificationLink = {
  newQuoteReceived: (moveRequestId: number) => `/myEstimates/${moveRequestId}`, // 고객
  quoteAccepted: (_moveRequestId: number) => `/sentEstimates`, // 기사
  reviewReceived: (moverId: number) => `/movers/${moverId}`, // 기사 //새로 만들긴해야할듯
} as const;
