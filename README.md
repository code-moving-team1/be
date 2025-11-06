## 무빙

![logo](https://i.imgur.com/bvVO9xc.png)

> 2025.09.16 - 2025.02.26 </br>
> 코드잇 스프린트 풀스택 7기 고급 프로젝트 1팀 (Backend)
> </br> > [Frontend Github 바로가기 🔗](https://github.com/code-moving-team1/fe)

</br>

- [무빙] 홈페이지: https://fe-real.vercel.app/
- 🗂️ 팀 문서: https://www.notion.so/Team-1-Moving-2a302c9248648010ae36ea03ecd05cf5
- 🔍 API 명세: https://www.notion.so/API-2a302c92486481ebaf28e05f9798ca47

</br>

## 🛠️ 기술스택

<img src="https://img.shields.io/badge/NestJS-000000?style=for-the-badge&logo=nestjs&logoColor=E0234E"> ![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) <img src="https://img.shields.io/badge/Passport-000000?style=for-the-badge&logo=passport&logoColor=34E27A"> ![JWT](https://img.shields.io/badge/json%20web%20tokens-323330?style=for-the-badge&logo=json-web-tokens&logoColor=pink) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=Jest&logoColor=white) ![Socketio](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

![postgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=#880000) ![Redis](https://img.shields.io/badge/redis-FF4438.svg?&style=for-the-badge&logo=redis&logoColor=white) ![BullMQ](https://img.shields.io/badge/Bullmq-A8A59B.svg?&style=for-the-badge&logo=&logoColor=white)

<img src="https://img.shields.io/badge/AWS EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white"> <img src="https://img.shields.io/badge/AWS Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white"> <img src="https://img.shields.io/badge/AWS S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white"> <img src="https://img.shields.io/badge/AWS RDS-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white"> <img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=green"> <img src="https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=PM2&logoColor=green"> ![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white) ![Kibana](https://img.shields.io/badge/Kibana-005571?style=for-the-badge&logo=kibana&logoColor=white)

![github](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white) ![slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white) ![discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white) ![notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white) ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white) ...etc

</br>

## 💁 구성원

|                              정우진                              |                           이예원                            |
| :--------------------------------------------------------------: | :---------------------------------------------------------: |
|            ![imgur](https://i.imgur.com/lVepEn6.png)             |          ![imgur](https://i.imgur.com/YLesOfA.png)          |
|                             **팀장**                             |                        **백엔드장**                         |
| 노션 관리, 백엔드 GitHub 관리, 중간 발표 자료 제작, 배포 및 관리 | 회의록 관리, 발표 자료 정리, Lambda 배포, 데이터베이스 관리 |
|        [Github 바로가기 🔗](https://github.com/Maybeiley)        |    [Github 바로가기 🔗](https://github.com/taeyeonkim94)    |

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
- 테스트 파일 구현
  - 전체적인 테스트 설정 세팅
  - plan, quote, chatRoom, chat 모델 e2e 테스트 파일 구현
- Plan API 구현
- Quote API 구현
- Chat API 구현
  - 이미지 및 동영상을 s3에 업로드 및 Presigned URL 구현
  - 이미지가 업로드 될 때 최적화 해주는 lambda 함수 구현 및 적용
- ChatRoom API 구현
  - 웹소켓을 이용해 구현
- 다른 종류의 데이터베이스 transaction 구현
  - 의존성 최소화를 위해 AOP를 통한 데코레이터로 구현
- 스케줄러 구현 및 적용

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
