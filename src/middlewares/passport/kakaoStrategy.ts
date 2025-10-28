import { Strategy as KakaoStrategy } from "passport-kakao";
import authService from "../../services/auth.service";

// 공통 Kakao OAuth 옵션
const baseKakaoOptions = {
  clientID: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
  scope: ["profile_nickname", "account_email", "profile_image"],
};

// Mover용 Kakao Strategy
export const kakaoMoverStrategy = new KakaoStrategy(
  {
    ...baseKakaoOptions,
    callbackURL: "/api/auth/mover/kakao/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(`프로필 있니? ${profile} dd`);
      console.log(profile);
      const { id, displayName } = profile;
      const email = profile._json.kakao_account.email;
      const profileImage = profile._json.properties.profile_image;

      if (!email) {
        return done(
          new Error("Kakao 계정에서 이메일을 가져올 수 없습니다."),
          undefined
        );
      }

      const user = await authService.kakaoOAuth({
        kakaoId: String(id),
        email,
        username: displayName,
        profileImage,
        userType: "MOVER",
      });

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }
);

// Customer용 Kakao Strategy
export const kakaoCustomerStrategy = new KakaoStrategy(
  {
    ...baseKakaoOptions,
    callbackURL: "/api/auth/customer/kakao/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, displayName } = profile;
      const email = profile._json.kakao_account.email;
      const profileImage = profile._json.properties.profile_image;

      if (!email) {
        return done(
          new Error("Kakao 계정에서 이메일을 가져올 수 없습니다."),
          undefined
        );
      }

      const user = await authService.kakaoOAuth({
        kakaoId: String(id),
        email,
        username: displayName,
        profileImage,
        userType: "CUSTOMER",
      });

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }
);
