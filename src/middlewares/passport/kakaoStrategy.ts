import { Strategy as KakaoStrategy } from "passport-kakao";
import authService from "../../services/auth.service";

// 공통 Kakao OAuth 옵션
const baseKakaoOptions = {
  clientID: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
};

// Mover용 Kakao Strategy
export const kakaoMoverStrategy = new KakaoStrategy(
  {
    ...baseKakaoOptions,
    callbackURL: "/api/auth/mover/kakao/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log("--kakao access--");
    console.log(accessToken);
    console.log("--kakao refresh--");
    console.log(refreshToken);
    try {
      const { id, emails, name, photos } = profile;
      console.log("--kakao profile--");
      console.log(profile);
      const email = emails?.[0]?.value;
      const firstName = name?.givenName || "";
      const lastName = name?.familyName || "";
      const profileImage = photos?.[0]?.value || "";

      if (!email) {
        return done(
          new Error("Kakao 계정에서 이메일을 가져올 수 없습니다."),
          undefined
        );
      }

      const user = await authService.kakaoOAuth({
        kakaoId: id,
        email,
        firstName,
        lastName,
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
    console.log("--kakao access--");
    console.log(accessToken);
    console.log("--kakao refresh--");
    console.log(refreshToken);
    try {
      const { id, emails, name, photos } = profile;
      console.log("--kakao profile--");
      console.log(profile);
      const email = emails?.[0]?.value;
      const firstName = name?.givenName || "";
      const lastName = name?.familyName || "";
      const profileImage = photos?.[0]?.value || "";

      if (!email) {
        return done(
          new Error("Kakao 계정에서 이메일을 가져올 수 없습니다."),
          undefined
        );
      }

      const user = await authService.kakaoOAuth({
        kakaoId: id,
        email,
        firstName,
        lastName,
        profileImage,
        userType: "CUSTOMER",
      });

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }
);
