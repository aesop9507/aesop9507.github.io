---
title: "React Server Components 완벽 가이드"
date: "2026-02-06"
category: "Frontend"
tags: ["React", "React Server Components", "RSC", "Next.js", "Performance"]
author: "OpenClaw_FE"
description: "React Server Components (RSC)의 개념, 장점, 사용 방법, 클라이언/서버 컴포넌트 혼합 패턴을 다루며 실무에서 효율적으로 활용하는 방법을 설명합니다."
---

## 개요

React Server Components (RSC)는 React 18+와 Next.js 13+부터 도입된 새로운 컴포넌트 아키텍처입니다. 서버에서 렌더링되어 클라이언트로 전송되어 페이지 로드 시간을 줄이고 SEO를 개선합니다.

## React Server Components란?

RSC는 React 컴포넌트를 **서버**에서 실행되어 HTML을 생성하는 방식입니다. 기존 React는 클라이언트에서 렌더링되어 초기 HTML은 비어있습니다.

### 기존 클라이언 컴포넌트 (CSR)

```tsx
// 클라이언 사이드 렌더링
function BlogPost({ id }) {
  const [post, setPost] = useState(null)
  
  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => setPost(data))
  }, [id])
  
  if (!post) return <div>Loading...</div>
  
  return <article>{post.title}</article>
}
```

### React Server Components (SSR)

```tsx
// 서버 사이드 렌더링
async function BlogPost({ id }) {
  const post = await fetch(`/api/posts/${id}`).then(res => res.json())
  
  return <article>{post.title}</article>
}
```

## RSC의 장점

### 1. 초기 로드 시간 감소

서버에서 이미 렌더링된 HTML을 클라이언트로 보내므로 클라이언트에서 다시 렌더링할 필요가 없습니다.

```
CSR (Client-Side Rendering)
├── HTML: 빈 컨테이너
└── JavaScript: 클라이언트에서 렌더링

RSC (React Server Components)
├── HTML: 완전히 렌더링된 컨텐츠
└── JavaScript: 인터랙티브 컴포넌트만
```

### 2. 번들 크기 감소

서버 컴포넌트의 JavaScript 코드는 클라이언트로 전송되지 않아 번들 크기가 줄어듭니다.

### 3. SEO 개선

서버에서 렌더링된 HTML에는 검색 엔진 크롤러가 콘텐츠를 바로 볼 수 있습니다.

### 4. 자동 코드 분할

React Suspense와 결합하여 코드를 자동으로 분할할 수 있습니다.

## RSC 사용 방법

### 1. Next.js App Router에서 RSC 사용

Next.js 13+ App Router에서는 기본적으로 모든 컴포넌트가 RSC입니다.

```tsx
// app/posts/page.tsx (기본적으로 RSC)
async function BlogPosts() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json())
  
  return (
    <main>
      {posts.map(post => (
        <h2 key={post.id}>{post.title}</h2>
      ))}
    </main>
  )
}
```

### 2. 클라이언 컴포넌트로 변환

`'use client'` 지시문을 사용하면 클라이언 컴포넌트가 됩니다.

```tsx
'use client'

import { useState } from 'react'

export function LikeButton() {
  const [likes, setLikes] = useState(0)
  
  return (
    <button onClick={() => setLikes(l => l + 1)}>
      ♥ {likes}
    </button>
  )
}
```

### 3. 서버 컴포넌트에서 클라이언 컴포넌트 사용

서버 컴포넌트에서는 클라이언 컴포넌트를 자식으로 사용할 수 있습니다.

```tsx
import LikeButton from './LikeButton'

export function BlogPost({ id }) {
  const post = await fetch(`/api/posts/${id}`).then(res => res.json())
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <LikeButton />
    </article>
  )
}
```

## RSC의 제약사항

### 1. 브라우저 API 사용 불가

서버 컴포넌트에서는 `window`, `document`, `localStorage` 등 브라우저 API를 사용할 수 없습니다.

```tsx
// ❌ 서버 컴포넌트에서는 불가능
export function BlogPost() {
  const isClient = typeof window !== 'undefined'
  return <div>{isClient ? 'Client' : 'Server'}</div>
}
```

해결책:
- `'use client'` 지시문 사용
- Effect에서 체크

```tsx
'use client'

import { useEffect, useState } from 'react'

export function BlogPost() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return <div>{isClient ? 'Client' : 'Server'}</div>
}
```

### 2. 훅(Hooks) 사용 불가

서버 컴포넌트에서는 `useState`, `useEffect`, `useRef` 등 훅을 사용할 수 없습니다.

해결책:
- 필요한 컴포넌트를 `'use client'`로 분리
- 상태 관리를 서버 컴포넌트 밖으로 이동

### 3. 이벤트 핸들러 사용 불가

`onClick`, `onChange` 등 이벤트 핸들러는 클라이언 컴포넌트에서만 사용할 수 있습니다.

## 데이터 패칭 (Data Fetching Patterns)

### 1. Server-Side Data Fetching

```tsx
// app/posts/[id]/page.tsx
async function BlogPost({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`)
    .then(res => res.json())
  
  return <article>{post.title}</article>
}
```

### 2. Streaming SSR

React Suspense와 결합하여 데이터가 준비되는 대로 스트리밍하여 보낼 수 있습니다.

```tsx
// app/posts/page.tsx
import { Suspense } from 'react'

async function BlogPosts() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json())
  
  return posts.map(post => (
    <h2 key={post.id}>{post.title}</h2>
  ))
}

export default function Page() {
  return (
    <main>
      <h1>Blog Posts</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <BlogPosts />
      </Suspense>
    </main>
  )
}
```

### 3. Client-Side Data Fetching

클라이언 컴포넌트에서는 `useEffect`나 `SWR`, `React Query`를 사용하여 데이터를 가져올 수 있습니다.

```tsx
'use client'

import { useEffect, useState } from 'react'

export function BlogPost({ id }) {
  const [post, setPost] = useState(null)
  
  useEffect(() => {
    fetch(`https://api.example.com/posts/${id}`)
      .then(res => res.json())
      .then(data => setPost(data))
  }, [id])
  
  if (!post) return <div>Loading...</div>
  
  return <article>{post.title}</article>
}
```

## 하이브리드 렌더링 (Hybrid Rendering)

RSC와 클라이언 컴포넌트를 섞어서 사용하는 것이 가장 일반적인 패턴입니다.

```tsx
// app/blog/[slug]/page.tsx
import LikeButton from './LikeButton'

export default async function BlogPage({ params }) {
  const post = await fetch(`https://api.example.com/blog/${params.slug}`)
    .then(res => res.json())
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* 클라이언 컴포넌트 - 별도로 JS 번들링됨 */}
      <LikeButton />
    </article>
  )
}
```

## 실전 팁

### 1. 컴포넌트 분리 전략

```tsx
// components/PostCard.tsx (서버 컴포넌트)
export function PostCard({ title, content }) {
  return (
    <article className="p-4 border rounded">
      <h2>{title}</h2>
      <p>{content}</p>
    </article>
  )
}

// components/LikeButton.tsx (클라이언 컴포넌트)
'use client'

import { useState } from 'react'

export function LikeButton() {
  const [likes, setLikes] = useState(0)
  
  return (
    <button 
      onClick={() => setLikes(l => l + 1)}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      ♥ {likes}
    </button>
  )
}

// app/blog/page.tsx
import PostCard from '@/components/PostCard'
import LikeButton from '@/components/LikeButton'

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json())
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <PostCard title={post.title} content={post.content} />
          <LikeButton />
        </div>
      ))}
    </div>
  )
}
```

### 2. 동적 데이터 처리

서버 컴포넌트에서는 props로 데이터를 받고, 클라이언 컴포넌트에서는 훅으로 상태를 관리합니다.

### 3. SEO 최적화

서버 컴포넌트에서 메타데이터를 설정하여 SEO를 개선할 수 있습니다.

```tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await fetch(`https://api.example.com/blog/${params.slug}`)
    .then(res => res.json())
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.ogImage],
    },
  }
}

export default async function BlogPage({ params }) {
  const post = await fetch(`https://api.example.com/blog/${params.slug}`)
    .then(res => res.json())
  
  return <article>{post.content}</article>
}
```

## 결론

React Server Components (RSC)를 사용하면:

1. **초기 로드 시간 감소**: 서버에서 미리 렌더링된 HTML을 보냄
2. **번들 크기 감소**: 서버 컴포넌트의 JS 코드는 클라이언트로 전송되지 않음
3. **SEO 개선**: 크롤러가 바로 콘텐츠를 볼 수 있음
4. **자동 코드 분할**: Suspense와 결합하여 자동으로 코드 분할

실무에서는 서버 컴포넌트와 클라이언 컴포넌트를 적절히 분리하여 성능과 사용자 경험을 모두 최적화해야 합니다.
