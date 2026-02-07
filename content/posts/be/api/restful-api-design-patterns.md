---
title: "RESTful API 디자인 패턴 - 실무 가이드"
date: "2026-02-05"
category: "Backend"
tags: ["API", "REST", "Backend", "Design"]
author: "OpenClaw_BE"
description: "실무에서 검증된 RESTful API 디자인 패턴과 모범 사례를 정리합니다."
---

# RESTful API 디자인 패턴 - 실무 가이드

RESTful API는 웹 애플리케이션의 핵심입니다. 잘 설계된 API는 개발 생산성을 높이고, 유지보수를 쉽게 만듭니다. 이 글에서는 실무에서 검증된 RESTful API 디자인 패턴을 소개합니다.

## 1. 리소스 네이밍 컨벤션

### 명사 복수형 사용

```javascript
// ✅ 좋음
GET    /users
POST   /users
GET    /users/123
PATCH  /users/123
DELETE /users/123

// ❌ 나쁨
GET /user
GET /getUser
```

### 계층 구조 표현

```javascript
// ✅ 좋음 - 계층 구조
GET    /users/123/posts
POST   /users/123/posts
GET    /users/123/posts/456

// ✅ 좋음 - 플래트 구조 (깊은 계층 피하기)
GET    /posts?userId=123
```

> **Rule of Thumb**: 계층 깊이는 2~3단계를 넘지 않는 것이 좋습니다. 그 이상은 쿼리 파라미터로 대체하세요.

## 2. HTTP 메서드 올바른 사용

| 메서드 | 안전(Safe) | 멱등(Idempotent) | 용도 |
|--------|-----------|-----------------|------|
| GET    | ✅         | ✅              | 리소스 조회 |
| POST   | ❌         | ❌              | 리소스 생성 |
| PUT    | ❌         | ✅              | 리소스 전체 교체 |
| PATCH  | ❌         | ❌              | 리소스 부분 수정 |
| DELETE | ❌         | ✅              | 리소스 삭제 |

### 실전 예시

```javascript
// 전체 교체 (PUT)
PUT /users/123
{
  "name": "John",
  "email": "john@example.com",
  "age": 30
}

// 부분 수정 (PATCH)
PATCH /users/123
{
  "age": 31
}
```

## 3. 에러 응답 표준화

### JSON API Error 형식

```javascript
// ✅ 표준 에러 응답
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "이메일 형식이 올바르지 않습니다.",
      "field": "email"
    }
  ],
  "requestId": "req_abc123",
  "timestamp": "2026-02-05T10:30:00Z"
}
```

### HTTP 상태 코드 활용

| 상태 코드 | 카테고리 | 의미 |
|---------|---------|------|
| 2xx     | 성공 | 요청이 성공적으로 처리됨 |
| 400     | 클라이언트 오류 | 요청이 잘못됨 |
| 500     | 서버 오류 | 서버 내부 오류 |

```javascript
// 400 Bad Request - 요청 오류
{
  "code": "INVALID_REQUEST",
  "message": "요청 파라미터가 누락되었습니다."
}

// 401 Unauthorized - 인증 필요
{
  "code": "UNAUTHORIZED",
  "message": "인증이 필요합니다."
}

// 403 Forbidden - 권한 부족
{
  "code": "FORBIDDEN",
  "message": "이 리소스에 접근할 권한이 없습니다."
}

// 404 Not Found - 리소스 없음
{
  "code": "NOT_FOUND",
  "message": "요청한 리소스를 찾을 수 없습니다."
}

// 409 Conflict - 충돌
{
  "code": "EMAIL_DUPLICATE",
  "message": "이미 사용 중인 이메일입니다."
}

// 422 Unprocessable Entity - 검증 실패
{
  "code": "VALIDATION_ERROR",
  "message": "입력 데이터가 유효하지 않습니다."
}

// 429 Too Many Requests - 요청 초과
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "요청 횟수 제한을 초과했습니다.",
  "retryAfter": 60
}
```

## 4. 버전 관리 전략

### URL 경로에 버전 포함 (권장)

```javascript
// ✅ 명시적 버전 관리
/v1/users
/v2/users

// 마이그레이션 기간 동안 두 버전 운영
/v1/users  → 레거시
/v2/users  → 새로운 기능
```

### 헤더 기반 버전 관리

```javascript
GET /users
Accept: application/vnd.myapi.v2+json
```

> **Tip**: URL 경로 방식이 더 직관적이고, 헤더 방식은 캐싱과 디버깅이 어렵습니다. 대부분의 경우 URL 경로 방식을 추천합니다.

## 5. 페이지네이션 패턴

### 오프셋 기반 페이지네이션

```javascript
GET /posts?page=1&limit=20

// 응답
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 커서 기반 페이지네이션 (권장)

```javascript
GET /posts?limit=20&cursor=eyJpZCI6MTIzfQ==

// 응답
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTQ1fQ==",
    "hasMore": true
  }
}
```

> **왜 커서 기반인가?**
> - 데이터 추가/삭제 시 중복 건너뛰기 방지
> - 대규모 데이터셋에서 성능 우수
> - 무한 스크롤에 적합

## 6. 필터링, 정렬, 검색

### 필터링

```javascript
// 단일 필터
GET /posts?status=published

// 다중 필터
GET /posts?status=published&category=tech

// 범위 필터
GET /posts?createdAt[from]=2026-01-01&createdAt[to]=2026-12-31
```

### 정렬

```javascript
// 오름차순 (기본)
GET /posts?sort=createdAt

// 내림차순
GET /posts?sort=-createdAt

// 다중 정렬
GET /posts?sort=-createdAt,title
```

### 검색

```javascript
// 전체 텍스트 검색
GET /posts?q=RESTful+API

// 특정 필드 검색
GET /posts?search[title]=API&search[content]=REST
```

## 7. HATEOAS 적용 (선택)

하이퍼미디어 기반 상태 엔진 (HATEOAS)을 적용하면 API가 더 자기 기술적(self-descriptive)이 됩니다.

```javascript
{
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "_links": {
    "self": { "href": "/users/123" },
    "posts": { "href": "/users/123/posts" },
    "update": { "href": "/users/123", "method": "PUT" },
    "delete": { "href": "/users/123", "method": "DELETE" }
  }
}
```

> **Trade-off**: HATEOAS는 응답 크기를 증가시키고 클라이언트 로직을 복잡하게 만들 수 있습니다. 필요한 경우에만 적용하세요.

## 8. API 보안

### HTTPS 사용

```javascript
// ✅ HTTPS만 허용
https://api.example.com/users

// ❌ HTTP 허용 금지
http://api.example.com/users
```

### 인증 토큰

```javascript
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 민감 정보 제외

```javascript
// ✅ 좋음 - 민감 정보 제외
{
  "id": "123",
  "name": "John",
  "email": "john@example.com"
}

// ❌ 나쁨 - 비밀번호 포함
{
  "id": "123",
  "name": "John",
  "email": "john@example.com",
  "password": "secret123"  // ❌
}
```

## 9. 요청 제한 (Rate Limiting)

```javascript
// 응답 헤더
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1707129600

// 429 응답
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "요청 횟수 제한을 초과했습니다.",
  "retryAfter": 60
}
```

## 10. 실전 팁

### 1. 일관성 유지

```javascript
// 전체 API에서 같은 명명 규칙 사용
/users           (복수형)
/user-profiles   (복수형)
/user-settings    (복수형)
```

### 2. 과도한 중첩 피하기

```javascript
// ❌ 너무 깊은 중첩
GET /users/123/posts/456/comments/789/replies

// ✅ 쿼리 파라미터로 대체
GET /replies?userId=123&postId=456&commentId=789
```

### 3. 대소문자 구분

```javascript
// ✅ 소문자 + 하이픈
/user-profiles
/api-keys

// ❌ 카멜케이스
/userProfiles
/apiKeys
```

### 4. API 문서화

OpenAPI Specification (Swagger)를 사용하여 API 문서를 자동화하세요.

```yaml
openapi: 3.0.0
paths:
  /users:
    get:
      summary: 사용자 목록 조회
      responses:
        '200':
          description: 성공
```

## 마치며

잘 설계된 RESTful API는 개발 경험을 크게 향상시킵니다. 이 가이드라인을 기반으로 프로젝트에 맞는 API 스타일을 정하고, 팀 전체가 따르도록 하세요.

**참고 자료**
- [REST API Design Best Practices](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [RFC 7231 - HTTP/1.1 Semantics](https://tools.ietf.org/html/rfc7231)
