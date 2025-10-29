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

const REDIRECT_CUSTOMER = "/auth/success?type=customer";
const REDIRECT_MOVER = "/auth/success?type=mover";

/**
 * 쿠키를 포함한 리다이렉트 (HTML 응답 사용)
 * 리버스 프록시 환경에서도 쿠키가 정상적으로 저장되도록 함
 */
function redirectWithCookies(res: express.Response, redirectUrl: string) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const fullUrl = `${frontendUrl}${redirectUrl}`;

  // HTML 응답으로 리다이렉트 (쿠키는 응답 헤더에 포함됨)
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${fullUrl}">
        <script>window.location.href = "${fullUrl}";</script>
      </head>
      <body>
        <p>리다이렉트 중... <a href="${fullUrl}">여기를 클릭하세요</a></p>
      </body>
    </html>
  `);
}

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

      // 성공 시 리다이렉트 (쿠키 포함)
      redirectWithCookies(res, REDIRECT_MOVER);
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

      // 성공 시 리다이렉트 (쿠키 포함)
      redirectWithCookies(res, REDIRECT_CUSTOMER);
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

      // 성공 시 리다이렉트 (쿠키 포함)
      redirectWithCookies(res, REDIRECT_MOVER);
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

      // 성공 시 리다이렉트 (쿠키 포함)
      redirectWithCookies(res, REDIRECT_CUSTOMER);
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

      // 성공 시 리다이렉트 (쿠키 포함)
      redirectWithCookies(res, REDIRECT_MOVER);
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

      // 성공 시 리다이렉트 (쿠키 포함)
      redirectWithCookies(res, REDIRECT_CUSTOMER);
    } catch (error) {
      next(error);
    }
  }
);

export { moverAuthController, customerAuthController };
