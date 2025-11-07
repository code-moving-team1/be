# 무빙

> ## 2025.04.10 - 2025.11.10 </br>
>
> ### 코드잇 스프린트 풀스택 7기 고급 프로젝트 1팀 (BackEnd) </br>
>
> [FrontEnd Github 바로가기 🔗](https://github.com/code-moving-team1/fe)

- [[무빙] 홈페이지](https://fe-real.vercel.app)
- [🗂️ 팀 문서](https://www.notion.so/Team-1-Moving-2a302c9248648010ae36ea03ecd05cf5?source=copy_link)
- [🔍 API 명세](https://www.notion.so/API-2a302c92486481ebaf28e05f9798ca47)

</br>

## 🛠️ 기술스택

<!-- Language / Runtime -->

### 🔧 Language / Runtime

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

<!-- Web Framework -->

### 🧭 Web Framework

![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

<!-- Auth -->

### 🔐 Auth

![Passport](https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=passport&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Google](https://img.shields.io/badge/Google%20OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Kakao](https://img.shields.io/badge/Kakao%20Login-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=000)
![Naver](https://img.shields.io/badge/Naver%20Login-03C75A?style=for-the-badge&logo=naver&logoColor=white)
![Session](https://img.shields.io/badge/Session-6DB33F?style=for-the-badge&logo=databricks&logoColor=white)

<!-- Database / Infra -->

### 🗃️ Database / Infra

![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

<!-- Realtime -->

### ⚡ Realtime

![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

<!-- Validation / Utils -->

### 🧪 Validation / Utils

![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-338DFF?style=for-the-badge&logo=keepassxc&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-EB5424?style=for-the-badge)
![Morgan](https://img.shields.io/badge/Morgan-000000?style=for-the-badge)
![dotenv](https://img.shields.io/badge/dotenv-000000?style=for-the-badge)
![Toss Payments](https://img.shields.io/badge/Toss%20Payments-0064FF?style=for-the-badge)

<!-- Background Jobs / Scheduling -->

### ⏰ Background Jobs / Scheduling

![Cron](https://img.shields.io/badge/Cron-4B5563?style=for-the-badge)

<!-- Tooling -->

### 🧰 Tooling

![github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white) ![discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white) ![notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white) ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white) ...etc

</br>

## 💁 구성원

|           정우진            |      이예원      |      김태홍      |
| :-------------------------: | :--------------: | :--------------: |
| **팀장** <br/> 배포 및 관리 | GitHub 이슈 관리 | GitHub 이슈 관리 |

</br>

## 📋 팀원별 구현 기능 상세

### [이예원]

- Auth API 구현
  - 인증/인가 토큰 기능 구현
  - 구글, 카카오, 네이버 OAuth Strategy 및 기능 구현
  - 미들웨어를 통한 인증/인가 기능 구현
- Mover, Customer API 구현
- Profile API 구현
- DirectQuoteRequest API 구현
- Likes API 구현
- MoveRequest /customer용 API 구현
- Quote API 구현
- Review 조회 API 구현
- DB 스키마 설계 및 구현
- 에러 카탈로그 일부 작성

### [정우진]

- 기초세팅
  - 백엔드폴더링 (3-Layer Architecture)
  - schema.prisma 설계
- moveRequest API 구현
  - 고객이 이사요청 생성, 조건에 맞는 이사요청 리스트, 이사요청 단건 상세 조회
- Review API 구현
  - 고객이 작성가능한 리뷰 리스트, 리뷰작성, 내가 작성한 리뷰 리스트
- Notification API 구현
  - 알림 목록 조회, UnreadCnt, 단건읽음, 모두읽음
  - Socket.IO로 이용해 실시간 알림
- Booking API 구현
  - 견적확정시 transaction 로직 구현
- Chat API 구현
  - Socket.IO로 이용해 실시간 알림
  - 연결 시 초기 chat:history 전달, chat:message 브로드캐스트, chat:system 입·퇴장/오류 메시지
- Payment API 구현
  - 결제승인, 결제내역조회
- transaction 구현
  - 견적확정 tx : Booking 생성, MoveRequest/Quote 상태 변경, 관련 알림 발송까지 단일 트랜잭션으로 처리, 멱등성 키(idempotency key)로 중복 확정 방지, 실패 시 전체 롤백
  - 리뷰생성 tx : Review 생성, 기사 별점, totalReviews 갱신, 알림 발송 까지 단일 트랜잭션으로 처리, bookingId findUnique로 중복 방지, 실패 시 전체 롤백
  - 결제승인 tx : payments draft 생성, 토스api confirm확인, user의 points 상승, payments draft update ,status APPROVED 인지 확인하여 중복승인 방지, 실패시 전체 롤백
- 스케줄러 구현 및 적용

  - Cron 엔드포인트 + 크론 토큰 방식으로 Railway 배포환경에 크론연동하여 운영 자동화

  ### [김태홍]

- 에러 핸들러 구현
  - 에러 카탈로그 작성 및 규격화
- 이사 요청(일반 & 지정) 견적 작성 API 구현
- 견적 상세 페이지 (일반 & 기사) API 구현

</br>

## ⚓️ 백엔드 전략

- **도메인 모델**: 주요 개념을 도메인 모델로 추상화하여 복잡한 비즈니스 로직을 관리.

- **트랜잭션 처리**:

  - 동시 처리가 필요한 기능에 대해서 prisma transaction을 이용하여 데이터 정합성 관리

- **로그 관리:** 실시간 로그 모니터링 및 시각화
  - 애플리케이션 로그: Winston → AWS CloudWatch → Lambda → OpenSearch(Kibana)
  - 시스템 및 네트워크 로그: Node Exporter / NginX Exporer → Prometheus → Grafana
- **실시간 채팅 기능**: `@nestjs/websockets`와 `Socket.io`를 통해 클라이언트 간 실시간 메시지 전달 및 관리.
- **스케줄러**: `Cron jobs`를 사용하여 주기적으로 실행되는 작업을 자동화.
- **결제 시스템**: 외부 PG사 결제 API와의 연동을 통해 결제 처리 자동화.
- **실시간 알림**: SSE 단방향 통신을 통해 서버에서 클라이언트에 알림 전송.
- **캐싱 및 메시지 큐**: Redis를 활용하여 자주 조회하는 데이터를 캐싱하고 BullMQ를 통해 연산 작업 등을 메시지 큐로 비동기 처리

</br>

## 🍰 프로젝트 회고

- 백엔드 결과물: https://www.goforme.duckdns.org
- 발표 자료: https://www.notion.so/Team-1-Moving-2a302c9248648010ae36ea03ecd05cf5
- 시연 영상: https://www.notion.so/Team-1-Moving-2a302c9248648010ae36ea03ecd05cf5
- ERD : https://dbdiagram.io/d/68a68254466887cb45ec0a2f

</br>

## 📁 파일 구조

```
├── src
│   ├── constants
│   │   ├── enums.ts
│   │   └── notification.links.ts
│   ├── controllers
│   │   ├── auth.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── cron.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── directQuoteRequest.controller.ts
│   │   ├── likes.controller.ts
│   │   ├── mover.controller.ts
│   │   ├── moveRequest.controller.ts
│   │   ├── payments.controller.ts
│   │   ├── quote.controller.ts
│   │   └── review.controller.ts
│   ├── index.ts
│   ├── lib
│   │   ├── passport.ts
│   │   └── prisma.ts
│   ├── middlewares
│   │   ├── auth.ts
│   │   ├── cronAuth.ts
│   │   ├── error.middleware.ts
│   │   └── passport
│   ├── repositories
│   │   ├── booking.repository.ts
│   │   ├── customer.repository.ts
│   │   ├── directQuoteRequest.repository.ts
│   │   ├── likes.repository.ts
│   │   ├── mover.repository.ts
│   │   ├── moveRequest.repository.ts
│   │   ├── notification.repository.ts
│   │   ├── payments.repository.ts
│   │   ├── points.repository.ts
│   │   ├── quote.repository.ts
│   │   ├── refresh.repository.ts
│   │   └── review.repository.ts
│   ├── routes
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── cron.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── directQuoteRequest.routes.ts
│   │   ├── likes.routes.ts
│   │   ├── mover.routes.ts
│   │   ├── moveRequest.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── payments.routes.ts
│   │   ├── quote.routes.ts
│   │   └── review.routes.ts
│   ├── schemas
│   │   ├── moveRequest.schema.ts
│   │   ├── quote.schema.ts
│   │   └── review.schema.ts
│   ├── services
│   │   ├── auth.service.ts
│   │   ├── booking.service.ts
│   │   ├── cron.service.ts
│   │   ├── customer.service.ts
│   │   ├── directQuoteRequest.service.ts
│   │   ├── likes.service.ts
│   │   ├── mover.service.ts
│   │   ├── moveRequest.service.ts
│   │   ├── notification.service.ts
│   │   ├── payments.service.ts
│   │   ├── quote.service.ts
│   │   ├── review.service.ts
│   │   └── tx
│   ├── sockets
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── emitters.ts
│   │   ├── index.ts
│   │   ├── rooms.ts
│   │   └── types.ts
│   ├── types
│   │   ├── domain.ts
│   │   ├── prisma-extended.ts
│   │   ├── rating.ts
│   │   ├── realtime.ts
│   │   └── review.ts
│   └── utils
│       ├── cookies.ts
│       ├── errorCatalog.ts
│       ├── HttpError.ts
│       ├── mappers
│       ├── rating-helpers.ts
│       └── validation
├── test.http
└── tsconfig.json


```

## ⚙️ 환경변수

```
NODE_ENV="production"

DATABASE_URL="postgresql_url"

JWT_SECRET="JWT_SECRET"
SESSION_SECRET="SESSION_SECRET"
CRON_TOKEN="CRON_TOKEN_SECRET"

CORS_ORIGIN="https://fe-real.vercel.app,http://localhost:3000"
FRONTEND_URL="https://fe-real.vercel.app"
# FRONTEND_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="GOOGLE_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOOGLE_CLIENT_SECRET"

NAVER_CLIENT_ID="NAVER_CLIENT_ID"
NAVER_CLIENT_SECRET="NAVER_CLIENT_SECRET"

KAKAO_CLIENT_ID="KAKAO_CLIENT_ID"
KAKAO_CLIENT_SECRET="KAKAO_CLIENT_SECRET"

TOSS_SECRET_KEY="test_sk_TOSS_SECRET_KEY"
TOSS_TEST=true

```
