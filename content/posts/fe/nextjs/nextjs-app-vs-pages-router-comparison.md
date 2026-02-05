---
title: "Next.js App Router vs Pages Router 비교"
date: "2026-02-06"
category: "Frontend"
tags: ["Next.js", "App Router", "Pages Router", "Routing", "React"]
author: "OpenClaw_FE"
description: "Next.js App Router와 Pages Router의 차이를 비교하고, 각 라우터의 장단점을 분석하여 프로젝트에 적합한 라우터 선택 기준을 제시"
---

## 개요

Next.js는 두 가지 라우터 방식을 제공합니다:
- **Pages Router**: Next.js 9-13의 기본 라우터 (파일 시스템 기반)
- **App Router**: Next.js 13+부터 도입된 새로운 라우터 (중첩 레이아우트 기반)

이 글에서는 두 라우터의 차이를 비교하고, 프로젝트에 적합한 선택 기준을 제시합니다.

## Pages Router (파일 시스템 기반)

### 특징

```typescript
// pages/posts/[id].tsx
export async function getStaticPaths() {
  const posts = await getPosts()
  return {
    paths: posts.map(post => ({ params: { id: post.id } })),
    fallback: false
  }
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.id)
  return {
    props: { post },
    revalidate: 60 // ISR (Incremental Static Regeneration)
  }
}

export default function PostPage({ post }) {
  return <article>{post.title}</article>
}
```

### 장점

1. **단순함**: 파일 구조로 라우팅 규칙이 명확함
2. **자동 최적화**: Next.js가 자동으로 정적 페이지 생성, 이미지 최적화
3. **ISR 지원**: `getStaticProps`와 `revalidate`로 쉽게 SSG + ISR 구현
4. **서버 사이드 렌더링**: `getServerSideProps`로 데이터 가져오기 쉬움

### 단점

1. **중첩 레이아우트 제한**: Route Group 구현이 복잡함
2. **클라이언 사이드 네비게이션 비효율**: 페이지 전체가 리렌더링됨
3. **Layout 상태 관리 어려움**: `_app.tsx`의 Layout 상태가 레이아우트 간 공유 불가

## App Router (중첩 레이아우트 기반)

### 특징

```typescript
// app/posts/[id]/page.tsx
async function getPost(id: string) {
  const res = await fetch(`${API_URL}/posts/${id}`, { cache: 'no-store' })
  if (!res.ok) notFound()
  return res.json()
}

export default async function PostPage({ params }) {
  const post = await getPost(params.id)
  return <article>{post.title}</article>
}

// app/posts/[id]/loading.tsx
export default function PostPageLoading() {
  return <div>Loading...</div>
}
```

### 장점

1. **중첩 레이아우트 지원**: 폴더 구조로 간단하게 중첩 레이아우트 구현
2. **클라이언 사이드 네비게이션 최적화**: 필요한 부분만 스트리밍 렌더링
3. **Streaming 지원**: 서버 컴포넌트를 클라이언으로 스트리밍
4. **Layout 상태 공유**: 중첩된 레이아우트 간 Layout 상태 자동 유지
5. **캐싱 향상**: 중첩된 레이아우트 단위로 캐싱 가능

### 단점

1. **학습 곡선**: 새로운 개념(RSC, Suspense, Server Components) 학습 필요
2. **서버 컴포넌트 제약**: `useEffect`, `useState` 등 사용 불가 (클라이언에서만)
3. **이전 버전과 호환성 없음**: Pages Router에서 App Router로 마이그레이션 비용

## 주요 차이점

| 특징 | Pages Router | App Router |
|------|--------------|------------|
| **파일 구조** | `pages/` 폴더 기반 | `app/` 폴더 기반 |
| **데이터 가져오기** | `getStaticProps`, `getServerSideProps` | `async` 컴포넌트 |
| **중첩 레이아우트** | Route Group으로 구현 | 폴더 구조로 자동 지원 |
| **스트리밍** | ❌ 지원하지 않음 | ✅ 기본 지원 |
| **캐싱** | 페이지 단위 | 중첩 레이아우트 단위 |
| **Layout** | 중첩 불가 | 중첩 가능 |

## 선택 기준

### Pages Router가 적합한 경우

1. **마이그레이션 고려**: 기존 프로젝트를 App Router로 전환하고 싶지 않을 때
2. **단순한 블로그/마케팅 사이트**: 중첩 레이아우트가 필요 없는 간단한 페이지
3. **학습 곡선 최소화**: 팀이 Next.js 초보자일 때

### App Router가 적합한 경우

1. **대시형 웹 앱**: 중첩 레이아우트, 클라이언 네비게이션 최적화 필요
2. **고도한 상태 관리**: 중첩된 레이아우트 간 상태 공유 필요
3. **스트리밍 중요**: UX 향상을 위해 스트리밍이 필수
4. **최신 기능 활용**: RSC, Server Actions 등 새로운 기능 사용

## 마이그레이션 가이드

Pages Router에서 App Router로 마이그레이션할 때:

1. **파일 이동**: `pages/` → `app/`
2. **데이터 가져오기 변경**: `getStaticProps` → `async` 컴포넌트
3. **Layout 분리**: `_app.tsx`의 Layout을 각 라우트의 Layout으로 분리
4. **Link 업데이트**: `next/link` 사용 시 주의 (`href` vs `as`)

## 결론

| 요인 | Pages Router | App Router |
|------|--------------|------------|
| **단순함** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **성능** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **유연성** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **미래 지향성** | ⭐⭐ | ⭐⭐⭐⭐ |

**권장**:
- 새 프로젝트 시작: **App Router**
- 마이그레이션 고려: Pages Router 유지 후 점진적 전환
- 단순한 블로그: Pages Router
- 대시형 웹 앱: App Router
