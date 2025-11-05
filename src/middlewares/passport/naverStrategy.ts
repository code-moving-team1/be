import { Strategy as NaverStrategy } from "passport-naver";
import authService from "../../services/auth.service";

// 공통 Naver OAuth 옵션
const baseNaverOptions = {
  clientID: process.env.NAVER_CLIENT_ID!,
  clientSecret: process.env.NAVER_CLIENT_SECRET!,
};

// Mover용 Naver Strategy
export const naverMoverStrategy = new NaverStrategy(
  {
    ...baseNaverOptions,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/mover/naver/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, displayName, emails, _json } = profile;
      const email = emails?.[0]?.value;
      const nickname = displayName || _json?.nickname || "";
      const profileImage = _json?.profile_image || "";

      if (!email) {
        return done(
          new Error("Naver 계정에서 이메일을 가져올 수 없습니다."),
          undefined
        );
      }

      const user = await authService.naverOAuth({
        naverId: id,
        email,
        nickname: nickname, // Naver displayName을 nickname으로 사용
        profileImage,
        userType: "MOVER",
      });

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }
);

// Customer용 Naver Strategy
export const naverCustomerStrategy = new NaverStrategy(
  {
    ...baseNaverOptions,
    callbackURL: `${process.env.FRONTEND_URL}/api/auth/customer/naver/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, displayName, emails, _json } = profile;
      const email = emails?.[0]?.value;
      const nickname = displayName || _json?.nickname || "";
      const profileImage = _json?.profile_image || "";

      if (!email) {
        return done(
          new Error("Naver 계정에서 이메일을 가져올 수 없습니다."),
          undefined
        );
      }

      const user = await authService.naverOAuth({
        naverId: id,
        email,
        nickname: nickname, // Naver displayName을 nickname으로 사용
        profileImage,
        userType: "CUSTOMER",
      });

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }
);
