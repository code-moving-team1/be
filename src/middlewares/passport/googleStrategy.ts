import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authService from "../../services/auth.service";

// 공통 Google OAuth 옵션
const baseGoogleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
};

// Mover용 Google Strategy
export const googleMoverStrategy = new GoogleStrategy(
  {
    ...baseGoogleOptions,
    callbackURL: "/api/auth/mover/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, emails, name, photos } = profile;
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
);

// Customer용 Google Strategy
export const googleCustomerStrategy = new GoogleStrategy(
  {
    ...baseGoogleOptions,
    callbackURL: "/api/auth/customer/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const { id, emails, name, photos } = profile;
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
);
