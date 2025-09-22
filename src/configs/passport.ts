import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as KakaoStrategy } from "passport-kakao";
import * as userRepo from "../repositories/userRepo.js";

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: number, done) => {
  const user = await userRepo.findById(id);
  done(null, user as any);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
    },
    async (_at, _rt, profile, done) => {
      try {
        const providerId = String(profile.id);
        let user = await userRepo.findBySocial("google", profile.id);
        if (!user) {
          user = await userRepo.createSocial({
            provider: "google",
            providerId,
            email: profile.emails?.[0]?.value,
            nickname: profile.displayName,
            image: profile.photos?.[0]?.value,
          });
        }
        done(null, user as any);
      } catch (err) {
        done(err as any);
      }
    }
  )
);

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      callbackURL: "/auth/kakao/callback",
    },
    async (_at: any, _rt: any, profile: any, done: any) => {
      try {
        const providerId = String(profile.id);
        let user = await userRepo.findBySocial("kakao", profile.id);
        if (!user) {
          user = await userRepo.createSocial({
            provider: "kakao",
            providerId,
            email: profile._json?.kakao_account?.email,
            nickname: profile.displayName,
            image: profile._json?.properties?.profile_image,
          });
        }
        done(null, user as any);
      } catch (err) {
        done(err as any);
      }
    }
  )
);

export default passport;