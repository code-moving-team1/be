import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as NaverStrategy } from "passport-naver";
import passport from "passport";
import authService from "../../services/auth.service";

// 공통 Google OAuth 옵션
const baseGoogleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
};

// 공통 네이버 OAuth 옵션
const baseNaverOptions = {
  clientID: process.env.NAVER_CLIENT_ID!,
  clientSecret: process.env.NAVER_CLIENT_SECRET!,
};

// ===========================================
// Google OAuth Strategies
// ===========================================

// Mover용 Google Strategy
passport.use(
  "google-mover",
  new GoogleStrategy(
    {
      ...baseGoogleOptions,
      callbackURL: "/api/auth/mover/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("--google access--");
      console.log(accessToken);
      console.log("--google refresh--");
      console.log(refreshToken);
      try {
        const { id, emails, name, photos } = profile;
        console.log("--google profile--");
        console.log(profile);
        const email = emails?.[0]?.value;
        const firstName = name?.givenName || "";
        const lastName = name?.familyName || "";
        const profileImage = photos?.[0]?.value || "";

        if (!email) {
          return done(
            new Error("Google 계정에서 이메일을 가져올 수 없습니다."),
            undefined
          );
        }

        const user = await authService.googleOAuth({
          googleId: id,
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
  )
);

// Customer용 Google Strategy
passport.use(
  "google-customer",
  new GoogleStrategy(
    {
      ...baseGoogleOptions,
      callbackURL: "/api/auth/customer/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("--google access--");
      console.log(accessToken);
      console.log("--google refresh--");
      console.log(refreshToken);
      try {
        const { id, emails, name, photos } = profile;
        console.log("--google profile--");
        console.log(profile);
        const email = emails?.[0]?.value;
        const firstName = name?.givenName || "";
        const lastName = name?.familyName || "";
        const profileImage = photos?.[0]?.value || "";

        if (!email) {
          return done(
            new Error("Google 계정에서 이메일을 가져올 수 없습니다."),
            undefined
          );
        }

        const user = await authService.googleOAuth({
          googleId: id,
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
  )
);

// ===========================================
// 네이버 OAuth Strategies
// ===========================================

// Mover용 네이버 Strategy
passport.use(
  "naver-mover",
  new NaverStrategy(
    {
      ...baseNaverOptions,
      callbackURL: "/api/auth/mover/naver/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("--naver access--");
      console.log(accessToken);
      console.log("--naver refresh--");
      console.log(refreshToken);
      try {
        const { id, emails, name, photos } = profile;
        console.log("--naver profile--");
        console.log(profile);
        const email = emails?.[0]?.value;
        const firstName = name?.givenName || "";
        const lastName = name?.familyName || "";
        const profileImage = photos?.[0]?.value || "";

        if (!email) {
          return done(
            new Error("네이버 계정에서 이메일을 가져올 수 없습니다."),
            undefined
          );
        }

        const user = await authService.naverOAuth({
          naverId: id,
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
  )
);

// Customer용 네이버 Strategy
passport.use(
  "naver-customer",
  new NaverStrategy(
    {
      ...baseNaverOptions,
      callbackURL: "/api/auth/customer/naver/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("--naver access--");
      console.log(accessToken);
      console.log("--naver refresh--");
      console.log(refreshToken);
      try {
        const { id, emails, name, photos } = profile;
        console.log("--naver profile--");
        console.log(profile);
        const email = emails?.[0]?.value;
        const firstName = name?.givenName || "";
        const lastName = name?.familyName || "";
        const profileImage = photos?.[0]?.value || "";

        if (!email) {
          return done(
            new Error("네이버 계정에서 이메일을 가져올 수 없습니다."),
            undefined
          );
        }

        const user = await authService.naverOAuth({
          naverId: id,
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
  )
);

// ===========================================
// Passport 직렬화 설정
// ===========================================

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    // 사용자 정보를 DB에서 가져오는 로직
    // 실제 구현에서는 사용자 타입에 따라 다른 테이블에서 조회
    done(null, { id });
  } catch (error) {
    done(error, null);
  }
});

export default passport;
