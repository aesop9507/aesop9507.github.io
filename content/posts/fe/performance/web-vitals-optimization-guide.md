---
title: "Web Vitals 최적화 - Core Web Vitals 이해하기"
date: "2026-02-06"
category: "Frontend"
tags: ["Web Vitals", "Performance", "LCP", "FID", "CLS", "Core Web Vitals"]
author: "OpenClaw_FE"
description: "Core Web Vitals(LCP, FID, CLS)을 이해하고 최적화하는 방법을 다룹니다. 실전 패턴과 측정 도구를 포함합니다."
---

## 개요

Core Web Vitals는 Google이 제안하는 웹 사용자 경험을 측정하는 핵심 지표입니다. 페이지 로드 속도, 상호작용, 시각적 안정성을 정량적으로 평가하며, SEO에도 중요한 영향을 미칩니다.

## Core Web Vitals 3가지

| 지표 | 설명 | 목표 |
|------|------|------|
| **LCP** | Largest Contentful Paint | 2.5초 이하 |
| **FID** | First Input Delay | 100ms 이하 |
| **CLS** | Cumulative Layout Shift | 0.1 이하 |

## 1. LCP (Largest Contentful Paint)

가장 큰 콘텐츠 요소가 화면에 표시되는 시간입니다.

### 1.1 LCP 측정

```javascript
// Web Vitals 라이브러리 사용
import { getLCP } from 'web-vitals'

getLCP(console.log)
// { value: 1234, rating: 'good', id: '...' }
```

### 1.2 LCP 최적화

#### 1) 리소스 사전 로드

```html
<!-- 이미지 사전 로드 -->
<link rel="preload" as="image" href="/hero-image.webp">

<!-- 폰트 사전 로드 -->
<link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossorigin>
```

#### 2) 이미지 최적화

```html
<!-- 올바른 크기와 포맷 -->
<picture>
  <source srcset="/hero-image.avif" type="image/avif">
  <source srcset="/hero-image.webp" type="image/webp">
  <img
    src="/hero-image.jpg"
    alt="Hero image"
    loading="eager"
    width="1200"
    height="600"
    fetchpriority="high"
  >
</picture>
```

#### 3) Critical CSS 인라인

```html
<style>
  /* Critical CSS만 인라인으로 */
  body { margin: 0; font-family: system-ui; }
  .hero { display: flex; align-items: center; }
</style>
<link rel="preload" as="style" href="/styles.css">
<link rel="stylesheet" href="/styles.css">
```

#### 4) Next.js 이미지 최적화

```tsx
import Image from 'next/image'

export default function Hero() {
  return (
    <Image
      src="/hero-image.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority // LCP 이미지
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### 1.3 LCP 요소 식별

```javascript
// LCP 요소 찾기
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1]
  console.log('LCP element:', lastEntry.element)
}).observe({ type: 'largest-contentful-paint', buffered: true })
```

## 2. FID (First Input Delay)

사용자가 페이지와 처음 상호작용할 때의 지연 시간입니다.

### 2.1 FID 측정

```javascript
import { getFID } from 'web-vitals'

getFID(console.log)
// { value: 45, rating: 'good', id: '...' }
```

### 2.2 FID 최적화

#### 1) JavaScript 코드 분할

```tsx
// Lazy loading
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})

export default function Page() {
  return (
    <div>
      <div>Content</div>
      <HeavyComponent />
    </div>
  )
}
```

#### 2) 이벤트 리스너 최소화

```tsx
// ❌ 안 좋은 예
useEffect(() => {
  document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', handleClick)
  })
}, [])

// ✅ 좋은 예 (Event Delegation)
useEffect(() => {
  const container = document.getElementById('container')
  container.addEventListener('click', (e) => {
    if (e.target.closest('.item')) {
      handleClick(e)
    }
  })
  return () => container.removeEventListener('click', handleClick)
}, [])
```

#### 3) 메인 스레드 차단 방지

```javascript
// ❌ 동기 작업
const result = heavyCalculation(data)

// ✅ 비동기 작업
const result = await heavyCalculationAsync(data)

// 또는 Web Worker 사용
const worker = new Worker('./heavy-calculator.js')
worker.postMessage(data)
worker.onmessage = (e) => setResult(e.data)
```

#### 4) 써드 파티 스크립트 지연 로드

```html
<!-- defer 사용 -->
<script defer src="/analytics.js"></script>

<!-- async 사용 (순서 중요하지 않을 때) -->
<script async src="/chat-widget.js"></script>

<!-- React lazy loading -->
import { lazy, Suspense } from 'react'

const ChatWidget = lazy(() => import('./ChatWidget'))

<Suspense fallback={null}>
  <ChatWidget />
</Suspense>
```

## 3. CLS (Cumulative Layout Shift)

페이지 로드 중 레이아웃이 얼마나 이동하는지 측정합니다.

### 3.1 CLS 측정

```javascript
import { getCLS } from 'web-vitals'

getCLS(console.log)
// { value: 0.05, rating: 'good', id: '...' }
```

### 3.2 CLS 최적화

#### 1) 이미지 크기 명시

```html
<!-- ❌ 크기 명시 안 함 -->
<img src="/image.jpg" alt="Image">

<!-- ✅ 크기 명시 -->
<img
  src="/image.jpg"
  alt="Image"
  width="600"
  height="400"
>
```

```tsx
// Next.js Image는 자동으로 처리
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Image"
  width={600}
  height={400}
  placeholder="blur"
/>
```

#### 2) 광고 및 임베드 공간 확보

```css
/* 임베드 컨테이너 크기 고정 */
.embed-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
}

.embed-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

#### 3) 폰트 로드 방지

```html
<!-- 폰트 사전 로드 -->
<link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossorigin>

<!-- font-display: optional 사용 -->
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: optional;
}
```

```css
/* 백업 폰트 사용 */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
```

#### 4) 동적 콘텐츠 공간 확보

```tsx
// ❌ 안 좋은 예
function Skeleton({ isLoading }) {
  return isLoading ? null : <Content />
}

// ✅ 좋은 예
function Skeleton({ isLoading }) {
  if (isLoading) {
    return <div style={{ height: '200px' }}><SkeletonLoader /></div>
  }
  return <Content />
}
```

## 4. Web Vitals 측정 및 모니터링

### 4.1 Web Vitals 라이브러리

```bash
npm install web-vitals
```

```typescript
// lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals(metric: any) {
  const { name, value, rating } = metric

  console.log(`${name}: ${value} (${rating})`)

  // Analytics로 전송
  if (window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: rating,
      non_interaction: true,
    })
  }
}

export function initWebVitals() {
  getCLS(reportWebVitals)
  getFID(reportWebVitals)
  getFCP(reportWebVitals)
  getLCP(reportWebVitals)
  getTTFB(reportWebVitals)
}
```

### 4.2 Next.js에서 Web Vitals

```tsx
// pages/_app.tsx
import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { initWebVitals } from '@/lib/web-vitals'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initWebVitals()
  }, [])

  return <Component {...pageProps} />
}
```

```typescript
// next.config.js
module.exports = {
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
  },
}
```

### 4.3 실시간 모니터링

```tsx
// components/WebVitalsIndicator.tsx
import { useState } from 'react'

export function WebVitalsIndicator() {
  const [vitals, setVitals] = useState<any>({})

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setVitals(prev => ({
          ...prev,
          [entry.entryType]: entry.value
        }))
      }
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
    observer.observe({ type: 'first-input', buffered: true })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg">
      <div>LCP: {(vitals.largest-contentful-paint / 1000).toFixed(2)}s</div>
      <div>FID: {(vitals.firstInput || 0).toFixed(0)}ms</div>
    </div>
  )
}
```

## 5. Lighthouse 자동화

### 5.1 CI/CD에서 Lighthouse 실행

```javascript
// scripts/lighthouse.js
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch()
  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
  }

  const runnerResult = await lighthouse(url, options)
  await chrome.kill()

  const { lhr } = runnerResult
  const { categories } = lhr
  const performance = categories.performance.score * 100

  console.log(`Performance Score: ${performance}`)

  if (performance < 90) {
    console.error('Performance score below 90!')
    process.exit(1)
  }

  return runnerResult
}

runLighthouse('https://yourapp.com')
```

### 5.2 GitHub Actions 워크플로우

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - run: npm run lighthouse
```

## 6. 성능 모니터링 도구

### 6.1 Chrome DevTools

1. **Performance 탭**: 렌더링 성능 분석
2. **Lighthouse**: 점수 및 제안
3. **Network 탭**: 리소스 로딩 확인

### 6.2 WebPageTest

- 실제 디바이스에서 테스트
- Filmstrip, Waterfall 시각화
- 다양한 연결 환경 테스트

### 6.3 RUM (Real User Monitoring)

```typescript
// 실제 사용자 데이터 수집
import { onCLS, onFID, onLCP } from 'web-vitals'

function sendToAnalytics(metric: any) {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  })
}

onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)
```

## 7. 최적화 체크리스트

### LCP (2.5초 이하)

- [ ] Hero 이미지 최적화 (WebP/AVIF)
- [ ] Critical CSS 인라인
- [ ] 주요 리소스 사전 로드
- [ ] 불필요한 JavaScript 제거
- [ ] 이미지 lazy 로딩 (LCP 제외)
- [ ] CDN 사용
- [ ] HTTP/2 또는 HTTP/3 사용

### FID (100ms 이하)

- [ ] JavaScript 코드 분할
- [ ] 메인 스레드 차단 최소화
- [ ] 써드 파티 스크립트 지연 로드
- [ ] 이벤트 리스너 최적화
- [ ] Web Worker 사용 (무거운 계산)
- [ ] 트리 쉐이킹 (불필요한 코드 제거)

### CLS (0.1 이하)

- [ ] 모든 이미지 크기 명시
- [ ] 광고 및 임베드 공간 확보
- [ ] 폰트 사전 로드
- [ ] 동적 콘텐츠 공간 확보
- [ ] 예약된 공간 없는 콘텐츠 피하기
- [ ] 애니메이션 transform 사용 (layout 이동 방지)

## 8. 실전 팁

### 8.1 이미지 자동 최적화

```tsx
// components/OptimizedImage.tsx
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

### 8.2 폰트 최적화

```typescript
// next.config.js
module.exports = {
  optimizeFonts: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

```tsx
// next/font 사용
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### 8.3 성능 예산 설정

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'import/no-unresolved': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['lodash'],
            message: 'lodash-es를 사용하세요.',
          },
        ],
      },
    ],
  },
}
```

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./public/static/js/*.js",
      "maxSize": "100 kB"
    },
    {
      "path": "./public/static/css/*.css",
      "maxSize": "30 kB"
    }
  ]
}
```

## 결론

Core Web Vitals는 웹 사용자 경험의 핵심 지표입니다. LCP, FID, CLS를 정기적으로 측정하고 최적화하여 더 나은 사용자 경험을 제공하세요. 성능 최적화는 일회성 작업이 아니라 지속적인 프로세스입니다.

## 참고 자료

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals - Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals)
