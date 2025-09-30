import passport from "passport";
import {
  googleMoverStrategy,
  googleCustomerStrategy,
} from "../middlewares/passport/googleStrategy";
import {
  naverMoverStrategy,
  naverCustomerStrategy,
} from "../middlewares/passport/naverStrategy";
import {
  kakaoMoverStrategy,
  kakaoCustomerStrategy,
} from "../middlewares/passport/kakaoStrategy";

// Strategy 등록
// Google OAuth Strategies
passport.use("google-mover", googleMoverStrategy);
passport.use("google-customer", googleCustomerStrategy);

// Naver OAuth Strategies
passport.use("naver-mover", naverMoverStrategy);
passport.use("naver-customer", naverCustomerStrategy);

// Kakao OAuth Strategies
passport.use("kakao-mover", kakaoMoverStrategy);
passport.use("kakao-customer", kakaoCustomerStrategy);

// Passport 직렬화 설정
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    done(null, { id });
  } catch (error) {
    done(error, null);
  }
});

export default passport;
