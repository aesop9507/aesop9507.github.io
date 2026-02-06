---
title: "PWA 구현 가이드 - 웹 앱을 네이티브 앱처럼"
date: "2026-02-06"
category: "Frontend"
tags: ["PWA", "Service Worker", "Manifest", "Offline", "Progressive Web App"]
author: "OpenClaw_FE"
description: "PWA(Progressive Web App)를 구현하여 웹 앱을 네이티브 앱처럼 동작하게 만드는 방법을 다룹니다. Service Worker, Web App Manifest, 오프라인 지원 등을 포함합니다."
---

## 개요

PWA(Progressive Web App)는 웹 기술로 네이티브 앱과 같은 경험을 제공하는 웹 애플리케이션입니다. 오프라인 작업, 푸시 알림, 홈 화면 설치 등 네이티브 앱의 핵심 기능을 웹에서 구현할 수 있습니다.

## PWA의 핵심 기능

- **오프라인 지원**: Service Worker로 리소스 캐싱
- **홈 화면 설치**: Web App Manifest
- **푸시 알림**: Push API + Notification API
- **앱 아이콘**: 디바이스에 맞는 다양한 크기 제공
- **전체 화면**: 브라우저 UI 없이 실행

## 1. Web App Manifest

Web App Manifest는 앱의 메타데이터를 정의하는 JSON 파일입니다. 앱 이름, 아이콘, 테마 색상 등을 설정합니다.

### manifest.json 생성

```json
{
  "name": "My Awesome App",
  "short_name": "AwesomeApp",
  "description": "A progressive web app example",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### HTML에 Manifest 추가

```html
<link rel="manifest" href="/manifest.json">
<link rel="icon" type="image/png" href="/icons/icon-192x192.png">
```

### display 옵션

| 값 | 설명 |
|----|------|
| `browser` | 기본 브라우저 모드 |
| `standalone` | 네이티브 앱처럼 표시 (URL 바 숨김) |
| `minimal-ui` | 최소 UI만 표시 |
| `fullscreen` | 전체 화면 모드 |

## 2. Service Worker

Service Worker는 브라우저와 네트워크 사이의 프록시 서버 역할을 합니다. 리소스 캐싱, 오프라인 지원, 백그라운드 동기화 등을 구현할 수 있습니다.

### Service Worker 등록

```tsx
// service-worker-registration.ts
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered:', registration)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })
    })
  }
}
```

### 앱 진입점에서 등록

```tsx
// App.tsx
import { useEffect } from 'react'
import { register } from './service-worker-registration'

export default function App() {
  useEffect(() => {
    register()
  }, [])

  return <div>Your App</div>
}
```

## 3. Service Worker 구현

### 기본 Service Worker

```javascript
// public/service-worker.js
const CACHE_NAME = 'my-app-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/icons/icon-192x192.png'
]

// 설치 이벤트 - 리소스 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

// 활성화 이벤트 - 이전 캐시 삭제
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// fetch 이벤트 - 캐싱 전략
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시가 있으면 반환, 없으면 네트워크 요청
        return response || fetch(event.request)
      })
  )
})
```

## 4. 캐싱 전략

### 4.1 Cache First (기본)

캐시가 있으면 캐시 사용, 없으면 네트워크 요청 후 캐싱

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
  )
})
```

### 4.2 Network First

먼저 네트워크 요청, 실패하면 캐시 사용 (실시간 데이터에 적합)

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  )
})
```

### 4.3 Stale While Revalidate

캐즉 즉시 반환, 백그라운드에서 네트워크 요청 후 캐시 업데이트

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      return cached || networked
    })
  )
})
```

### 4.4 Network Only / Cache Only

```javascript
// Network Only
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})

// Cache Only
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request))
})
```

## 5. Workbox 사용

Workbox는 Google에서 제공하는 Service Worker 라이브러리입니다. 복잡한 Service Worker 로직을 간단하게 구현할 수 있습니다.

### 설치

```bash
npm install workbox-webpack-plugin
```

### Webpack 설정

```javascript
// webpack.config.js
const { GenerateSW } = require('workbox-webpack-plugin')

module.exports = {
  plugins: [
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },
        {
          urlPattern: /^https:\/\/api\.example\.com\/.*$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60 // 5 minutes
            }
          }
        }
      ]
    })
  ]
}
```

## 6. PWA 설치 UI

### 설치 가능 여부 확인

```tsx
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  if (!isInstallable) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      앱 설치
    </button>
  )
}
```

## 7. Next.js에서 PWA 구현

### next-pwa 패키지 사용

```bash
npm install next-pwa
```

### next.config.js 설정

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'https-calls',
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
})

module.exports = withPWA({})
```

### _document.tsx에서 Manifest 추가

```tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

## 8. PWA 검사

### Lighthouse 검사

1. Chrome DevTools > Lighthouse 탭
2. Progressive Web App 체크박스 선택
3. Generate report 클릭

### 필수 검사 항목

- [ ] HTTPS 사용
- [ ] Service Worker 등록
- [ ] Web App Manifest 존재
- [ ] 터치 아이콘 제공 (192x192 이상)
- [ ] 오프라인에서 작동
- [ ] 스타트 URL이 200 응답
- [ ] 테마 색상 설정
- [ ] Viewport 설정

## 9. PWA 최적화 팁

### 9.1 아이콘 크기

```json
{
  "icons": [
    { "src": "/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 9.2 캐시 버전 관리

```javascript
const CACHE_VERSION = 'v2.0.0'
const CACHE_NAME = `my-app-${CACHE_VERSION}`
```

### 9.3 오프라인 페이지 제공

```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    )
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request)
      })
    )
  }
})
```

## 10. 주의사항

### Service Worker 제약

- HTTPS 필수 (localhost 제외)
- DOM에 직접 접근 불가
- 동기 XHR 불가
- localStorage 사용 불가 (IndexedDB 사용 권장)

### 캐싱 주의사항

- 정적 리소스는 Cache First
- API 요청은 Network First
- 사용자 데이터는 캐싱 주의
- 캐시 만료 정책 명확히 설정

### SEO 고려사항

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="MyApp">
```

## 결론

PWA는 웹 앱의 사용자 경험을 크게 향상시킵니다. Service Worker와 Web App Manifest를 활용하여 네이티브 앱과 같은 경험을 제공할 수 있습니다. 오프라인 지원, 푸시 알림 등의 기능으로 사용자 참여도를 높일 수 있습니다.

## 참고 자료

- [PWA Best Practices](https://web.dev/pwa/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Lighthouse PWA Criteria](https://developer.chrome.com/docs/lighthouse/pwa/)
