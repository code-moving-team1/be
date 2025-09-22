import express from "express";
import moverService from "../services/mover.service";
import auth from "../middlewares/auth";

interface AuthenticatedRequest extends express.Request {
  user?: { id: number };
}

const moverController = express.Router();

// 1. 회원가입
moverController.post("/signup", async (req, res, next) => {
  try {
    const mover = await moverService.signup(req.body);
    res.status(201).json(mover);
  } catch (error) {
    next(error);
  }
});

// 2. 로그인
moverController.post("/signin", async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await moverService.signin(req.body);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 15,
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "strict",
    });

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
    const { accessToken } = await moverService.refresh(refreshToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 15,
      sameSite: "strict",
    });
    res.json({ message: "토큰 갱신 성공" });
  } catch (error) {
    next(error);
  }
});

// 4. 로그아웃
moverController.post("/logout", auth.verifyAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await moverService.logout(req.user!.id, "MOVER");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// 5. 내 정보 조회
moverController.get("/me", auth.verifyAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const mover = await moverService.getMe(req.user!.id, "MOVER");
    res.json(mover);
  } catch (error) {
    next(error);
  }
});

export default moverController;