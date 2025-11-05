import express from "express";
import authService, { saveTokens } from "../services/auth.service";
import auth from "../middlewares/auth";
import passport from "../lib/passport";
import { createError } from "../utils/HttpError";
import {
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../utils/cookies";
import jwt from "jsonwebtoken";

// Next.js API Route로 리다이렉트 (프론트엔드 URL 포함)
const REDIRECT_CUSTOMER =
  (process.env.FRONTEND_URL || "http://localhost:3000") +
  "/api/auth/success?type=customer";
const REDIRECT_MOVER =
  (process.env.FRONTEND_URL || "http://localhost:3000") +
  "/api/auth/success?type=mover";

const moverAuthController = express.Router();

// 1. 회원가입
moverAuthController.post("/signup", async (req, res, next) => {
  try {
    const mover = await authService.signupMover(req.body);
    res.status(201).json(mover);
  } catch (error) {
    next(error);
  }
});

// 2. 로그인
moverAuthController.post("/signin", async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.signin({
      ...req.body,
      userType: "MOVER",
    });
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ message: "로그인 성공" });
  } catch (error) {
    next(error);
  }
});

// 3. 토큰 갱신
moverAuthController.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw createError("AUTH/UNAUTHORIZED", {
        messageOverride: "유효하지 않은 리프레쉬 토큰입니다.",
      });
    }
    const { accessToken } = await authService.refresh(refreshToken);
    setAccessTokenCookie(res, accessToken);
    res.json({ message: "토큰 갱신 성공" });
  } catch (error) {
    next(error);
  }
});

// 4. 로그아웃
moverAuthController.post(
  "/logout",
  auth.verifyAuth,
  async (req: any, res, next) => {
    try {
      await authService.logout(req.user!.id, "MOVER");
      clearAuthCookies(res);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// 5. 내 정보 조회
moverAuthController.get("/me", auth.verifyAuth, async (req: any, res, next) => {
  try {
    const mover = await authService.getMe(req.user!.id, "MOVER");
    res.json(mover);
  } catch (error) {
    next(error);
  }
});

const customerAuthController = express.Router();

// 1. 회원가입
customerAuthController.post("/signup", async (req, res, next) => {
  try {
    const customer = await authService.signupCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// 2. 로그인
customerAuthController.post("/signin", async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.signin({
      ...req.body,
      userType: "CUSTOMER",
    });
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ message: "로그인 성공" });
  } catch (error) {
    next(error);
  }
});

// 3. 토큰 갱신
customerAuthController.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw createError("AUTH/UNAUTHORIZED", {
        messageOverride: "유효하지 않은 리프레쉬 토큰입니다.",
      });
    }
    const { accessToken } = await authService.refresh(refreshToken);
    setAccessTokenCookie(res, accessToken);
    res.json({ message: "토큰 갱신 성공" });
  } catch (error) {
    next(error);
  }
});

// 4. 로그아웃
customerAuthController.post(
  "/logout",
  auth.verifyAuth,
  async (req: any, res, next) => {
    try {
      await authService.logout(req.user!.id, "CUSTOMER");
      clearAuthCookies(res);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// 5. 내 정보 조회
customerAuthController.get(
  "/me",
  auth.verifyAuth,
  async (req: any, res, next) => {
    try {
      const customer = await authService.getMe(req.user!.id, "CUSTOMER");
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
);

// Google OAuth
moverAuthController.get(
  "/google",
  passport.authenticate("google-mover", {
    scope: ["profile", "email"],
  })
);

customerAuthController.get(
  "/google",
  passport.authenticate("google-customer", {
    scope: ["profile", "email"],
  })
);

// Google OAuth 콜백
moverAuthController.get(
  "/google/callback",
  passport.authenticate("google-mover", { failureRedirect: "/login" }),
  async (req: any, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw createError("AUTH/UNAUTHORIZED", {
          messageOverride: "Google OAuth 인증에 실패했습니다.",
        });
      }

      // 토큰 생성 및 refresh db에 저장
      const { accessToken, refreshToken } = await saveTokens(
        user.id,
        "MOVER",
        user.hasProfile
      );

      // 쿠키에 토큰 설정
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      // 성공 시 Next.js API Route로 직접 리다이렉트 (쿠키는 응답 헤더에 포함됨)
      res.redirect(REDIRECT_MOVER);
    } catch (error) {
      next(error);
    }
  }
);

customerAuthController.get(
  "/google/callback",
  passport.authenticate("google-customer", { failureRedirect: "/login" }),
  async (req: any, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw createError("AUTH/UNAUTHORIZED", {
          messageOverride: "Google OAuth 인증에 실패했습니다.",
        });
      }

      // 토큰 생성 및 refresh db에 저장
      const { accessToken, refreshToken } = await saveTokens(
        user.id,
        "CUSTOMER",
        user.hasProfile
      );

      // 쿠키에 토큰 설정
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      // 성공 시 Next.js API Route로 직접 리다이렉트 (쿠키는 응답 헤더에 포함됨)
      res.redirect(REDIRECT_CUSTOMER);
    } catch (error) {
      next(error);
    }
  }
);

// Naver OAuth 라우트들
// Naver 로그인 시작
moverAuthController.get(
  "/naver",
  passport.authenticate("naver-mover", {
    scope: ["profile", "email"],
  })
);

customerAuthController.get(
  "/naver",
  passport.authenticate("naver-customer", {
    scope: ["profile", "email"],
  })
);

// Naver OAuth 콜백
moverAuthController.get(
  "/naver/callback",
  passport.authenticate("naver-mover", { failureRedirect: "/login" }),
  async (req: any, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw createError("AUTH/UNAUTHORIZED", {
          messageOverride: "Naver OAuth 인증에 실패했습니다.",
        });
      }

      // 토큰 생성 및 refresh db에 저장
      const { accessToken, refreshToken } = await saveTokens(
        user.id,
        "MOVER",
        user.hasProfile
      );

      // 쿠키에 토큰 설정
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      // 성공 시 Next.js API Route로 직접 리다이렉트 (쿠키는 응답 헤더에 포함됨)
      res.redirect(REDIRECT_MOVER);
    } catch (error) {
      next(error);
    }
  }
);

customerAuthController.get(
  "/naver/callback",
  passport.authenticate("naver-customer", { failureRedirect: "/login" }),
  async (req: any, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw createError("AUTH/UNAUTHORIZED", {
          messageOverride: "Naver OAuth 인증에 실패했습니다.",
        });
      }

      // 토큰 생성 및 refresh db에 저장
      const { accessToken, refreshToken } = await saveTokens(
        user.id,
        "CUSTOMER",
        user.hasProfile
      );

      // 쿠키에 토큰 설정
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      // 성공 시 Next.js API Route로 직접 리다이렉트 (쿠키는 응답 헤더에 포함됨)
      res.redirect(REDIRECT_CUSTOMER);
    } catch (error) {
      next(error);
    }
  }
);

// Kakao OAuth 라우트들
// Kakao 로그인 시작
moverAuthController.get(
  "/kakao",
  passport.authenticate("kakao-mover", {
    scope: ["profile_nickname", "account_email", "profile_image"],
    prompt: "consent", // 동의 화면 강제 표시
  })
);

customerAuthController.get(
  "/kakao",
  passport.authenticate("kakao-customer", {
    scope: ["profile_nickname", "account_email", "profile_image"],
    prompt: "consent", // 동의 화면 강제 표시
  })
);

// Kakao OAuth 콜백
moverAuthController.get(
  "/kakao/callback",
  passport.authenticate("kakao-mover", { failureRedirect: "/login" }),
  async (req: any, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw createError("AUTH/UNAUTHORIZED", {
          messageOverride: "Kakao OAuth 인증에 실패했습니다.",
        });
      }

      // 토큰 생성 및 refresh db에 저장
      const { accessToken, refreshToken } = await saveTokens(
        user.id,
        "MOVER",
        user.hasProfile
      );

      // 쿠키에 토큰 설정
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      // 성공 시 Next.js API Route로 직접 리다이렉트 (쿠키는 응답 헤더에 포함됨)
      res.redirect(REDIRECT_MOVER);
    } catch (error) {
      next(error);
    }
  }
);

customerAuthController.get(
  "/kakao/callback",
  passport.authenticate("kakao-customer", { failureRedirect: "/login" }),
  async (req: any, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        throw createError("AUTH/UNAUTHORIZED", {
          messageOverride: "Kakao OAuth 인증에 실패했습니다.",
        });
      }

      // 토큰 생성 및 refresh db에 저장
      const { accessToken, refreshToken } = await saveTokens(
        user.id,
        "CUSTOMER",
        user.hasProfile
      );

      // 쿠키에 토큰 설정
      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, refreshToken);

      // 성공 시 Next.js API Route로 직접 리다이렉트 (쿠키는 응답 헤더에 포함됨)
      res.redirect(REDIRECT_CUSTOMER);
    } catch (error) {
      next(error);
    }
  }
);

// === MOVER: 소켓 토큰 발급 ===
moverAuthController.get(
  "/socket-token",
  auth.verifyAuth, // accessToken 쿠키 or Bearer로 인증
  async (req: any, res, next) => {
    try {
      const payload = { id: req.user!.id, userType: "MOVER" as const };
      const socketToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "5m",
      });
      res.json({ socketToken, expInSec: 300 });
    } catch (error) {
      next(error);
    }
  }
);

// === CUSTOMER: 소켓 토큰 발급 ===
customerAuthController.get(
  "/socket-token",
  auth.verifyAuth,
  async (req: any, res, next) => {
    try {
      const payload = { id: req.user!.id, userType: "CUSTOMER" as const };
      const socketToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "5m",
      });
      res.json({ socketToken, expInSec: 300 });
    } catch (error) {
      next(error);
    }
  }
);

export { moverAuthController, customerAuthController };
