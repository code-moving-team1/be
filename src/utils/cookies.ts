// src/utils/cookies.ts

import type { CookieOptions, Response } from "express";

export const COOKIE = {
  access: "accessToken",
  refresh: "refreshToken",
} as const;

const isProd = process.env.NODE_ENV === "production";

// 보통 domain은 생략(Host-only 쿠키). 여러 서브도메인에서 공유해야 할 때만 설정.
export const baseCookieOptions: CookieOptions = {
  httpOnly: true, // accessToken을 JS에서 읽어야 한다면 false 로 조정
  secure: isProd, // 배포에서 반드시 true (HTTPS)
  sameSite: isProd ? "none" : "lax",
  path: "/",
  // domain: process.env.COOKIE_DOMAIN, // 필요 시만 사용
};

export function setAuthCookies(res: Response, access: string, refresh: string) {
  res.cookie(COOKIE.access, access, {
    ...baseCookieOptions,
    maxAge: 1000 * 60 * 120, // 현재 설정(2h). 운영 전환 시 15m 추천
  });
  res.cookie(COOKIE.refresh, refresh, {
    ...baseCookieOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
  });
}

export function clearAuthCookies(res: Response) {
  // clearCookie도 동일 옵션으로!
  res.clearCookie(COOKIE.access, baseCookieOptions);
  res.clearCookie(COOKIE.refresh, baseCookieOptions);

  // 일부 브라우저 호환용(Expires 강제)
  res.cookie(COOKIE.access, "", { ...baseCookieOptions, maxAge: 0 });
  res.cookie(COOKIE.refresh, "", { ...baseCookieOptions, maxAge: 0 });
}
