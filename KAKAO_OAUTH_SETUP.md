# 카카오 OAuth 설정 가이드

## 1. 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 접속
2. 애플리케이션 생성 또는 기존 애플리케이션 선택
3. "제품 설정" > "카카오 로그인" 활성화
4. "제품 설정" > "카카오 로그인" > "동의항목" 설정:
   - 닉네임 (필수)
   - 카카오계정(이메일) (필수)
   - 프로필 사진 (선택)
5. "제품 설정" > "카카오 로그인" > "Redirect URI" 설정:
   - `http://localhost:4000/api/auth/mover/kakao/callback`
   - `http://localhost:4000/api/auth/customer/kakao/callback`
   - (프로덕션 환경에서는 실제 도메인으로 변경)

## 2. 환경 변수 설정

`.env` 파일에 다음 변수들을 추가하세요:

```env
# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Session Secret (Passport OAuth용)
SESSION_SECRET=your-session-secret-key

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console

# Naver OAuth 설정
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# 카카오 OAuth 설정
KAKAO_CLIENT_ID=your-kakao-client-id-from-console
KAKAO_CLIENT_SECRET=your-kakao-client-secret-from-console

# 프론트엔드 URL (OAuth 콜백 후 리다이렉트용)
FRONTEND_URL=http://localhost:3000

# 데이터베이스 설정
DATABASE_URL=your-database-url

# 서버 포트
PORT=4000

# 환경
NODE_ENV=development
```

## 3. 사용 방법

### Mover 카카오 OAuth 로그인

```
GET /api/auth/mover/kakao
```

### Customer 카카오 OAuth 로그인

```
GET /api/auth/customer/kakao
```

### 콜백 URL

- Mover: `/api/auth/mover/kakao/callback`
- Customer: `/api/auth/customer/kakao/callback`

## 4. 구현된 기능

✅ 카카오 OAuth Strategy 설정
✅ Passport 미들웨어 설정
✅ JWT 토큰 생성 및 쿠키 설정
✅ 사용자 자동 생성/로그인
✅ 프론트엔드 리다이렉트
✅ 에러 처리 및 로깅

## 5. 테스트 방법

1. 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:4000/api/auth/mover/kakao` 접속
3. 카카오 로그인 진행
4. 성공 시 프론트엔드로 리다이렉트

## 6. 주의사항

- 카카오 OAuth는 HTTPS 환경에서만 작동합니다 (로컬 개발 시에는 localhost 예외)
- 프로덕션 환경에서는 반드시 HTTPS를 사용하세요
- 환경 변수는 절대 공개하지 마세요
- 카카오 개발자 콘솔에서 도메인 설정을 정확히 해주세요
- 카카오 로그인 동의항목 설정을 확인하세요

## 7. API 엔드포인트

### 카카오 로그인 시작

- **Mover**: `GET /api/auth/mover/kakao`
- **Customer**: `GET /api/auth/customer/kakao`

### 카카오 로그인 콜백

- **Mover**: `GET /api/auth/mover/kakao/callback`
- **Customer**: `GET /api/auth/customer/kakao/callback`

### 성공 시 리다이렉트

- **Mover**: `{FRONTEND_URL}/auth/success?type=mover`
- **Customer**: `{FRONTEND_URL}/auth/success?type=customer`
