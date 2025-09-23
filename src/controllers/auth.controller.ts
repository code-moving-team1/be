import express from "express";
import authService from "../services/auth.service";
import auth from "../middlewares/auth";

interface AuthenticatedRequest extends express.Request {
  user?: { id: number };
}

function setTokenCookie(
  res: express.Response,
  tokenName: string,
  token: string
) {
  res.cookie(tokenName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 15,
    sameSite: "lax",
  });
}

const moverController = express.Router();

// 1. 회원가입
moverController.post("/signup", async (req, res, next) => {
  try {
    const mover = await authService.signupMover(req.body);
    res.status(201).json(mover);
  } catch (error) {
    next(error);
  }
});

// 2. 로그인
moverController.post("/signin", async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.signin({
      ...req.body,
      userType: "MOVER",
    });
    setTokenCookie(res, "accessToken", accessToken);
    setTokenCookie(res, "refreshToken", refreshToken);

    res.json({ message: "로그인 성공" });
  } catch (error) {
    next(error);
  }
});

// 3. 토큰 갱신
moverController.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "RefreshToken이 필요합니다." });
    }
    const { accessToken } = await authService.refresh(refreshToken);
    setTokenCookie(res, "accessToken", accessToken);
    res.json({ message: "토큰 갱신 성공" });
  } catch (error) {
    next(error);
  }
});

// 4. 로그아웃
moverController.post(
  "/logout",
  auth.verifyAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      await authService.logout(req.user!.id, "MOVER");
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// 5. 내 정보 조회
moverController.get(
  "/me",
  auth.verifyAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const mover = await authService.getMe(req.user!.id, "MOVER");
      res.json(mover);
    } catch (error) {
      next(error);
    }
  }
);

const customerController = express.Router();

// 1. 회원가입
customerController.post("/signup", async (req, res, next) => {
  try {
    const customer = await authService.signupCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// 2. 로그인
customerController.post("/signin", async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.signin({
      ...req.body,
      userType: "CUSTOMER",
    });
    setTokenCookie(res, "accessToken", accessToken);
    setTokenCookie(res, "refreshToken", refreshToken);

    res.json({ message: "로그인 성공" });
  } catch (error) {
    next(error);
  }
});

// 3. 토큰 갱신
customerController.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "RefreshToken이 필요합니다." });
    }
    const { accessToken } = await authService.refresh(refreshToken);
    setTokenCookie(res, "accessToken", accessToken);
    res.json({ message: "토큰 갱신 성공" });
  } catch (error) {
    next(error);
  }
});

// 4. 로그아웃
customerController.post(
  "/logout",
  auth.verifyAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      await authService.logout(req.user!.id, "CUSTOMER");
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

// 5. 내 정보 조회
customerController.get(
  "/me",
  auth.verifyAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const customer = await authService.getMe(req.user!.id, "CUSTOMER");
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }
);

export { moverController, customerController };
