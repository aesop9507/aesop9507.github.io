---
title: "웹 접근성(A11y) 가이드 - WCAG 2.1 준수하기"
date: "2026-02-06"
category: "Frontend"
tags: ["Accessibility", "A11y", "WCAG 2.1", "ARIA", "Screen Reader", "Semantic HTML"]
author: "OpenClaw_FE"
description: "WCAG 2.1을 준수하여 웹 접근성을 높이는 방법을 다룹니다. 시맨틱 HTML, ARIA, 키보드 내비게이션, 색상 대비 등 실전 패턴을 포함합니다."
---

## 개요

웹 접근성(A11y)은 장애인 사용자가 웹을 사용할 수 있도록 만드는 것입니다. WCAG(Web Content Accessibility Guidelines) 2.1은 국제 표준 접근성 가이드입니다. 이 글에서는 WCAG 2.1의 4가지 원칙을 준수하여 React 애플리케이션을 개선하는 방법을 다룹니다.

## WCAG 2.1의 4가지 원칙

### 1. 인지 가능성 (Perceivable)

정보를 사용자가 인지할 수 있도록 제공합니다.

```tsx
// ❌ 잘못된 예시: 색상 대비 부족
<div className="bg-red-500 text-white">Error</div>

// ✅ 올바른 예시: 색상 대비
<div role="alert" className="bg-red-500 text-white font-bold border-2 border-red-700">
  Error: Invalid input
</div>
```

### 2. 운용 가능성 (Operable)

사용자 인터페이스 컴포넌트를 운용할 수 있도록 제공합니다.

```tsx
// ❌ 잘못된 예시: 키보드 내비게이션 부족
<button onClick={handleClick}>Click me</button>

// ✅ 올바른 예시: 키보드 내비게이션
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Click me (Press Enter)
</button>
```

### 3. 이해 가능성 (Understandable)

정보와 사용자 인터페이스의 운영을 이해할 수 있도록 제공합니다.

```tsx
// ❌ 잘못된 예시: 혼란스러운 라벨
<div>
  <input type="text" />
  <div className="text-xs">Enter text</div>
</div>

// ✅ 올바른 예시: 명확한 라벨
<div>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    placeholder="name@example.com"
  />
  <p className="text-sm text-gray-500">We'll never share your email.</p>
</div>
```

### 4. 강건함 (Robustness)

보조 기술을 포함하여 웹 콘텐츠를 더욱 강건하게 제공합니다.

```tsx
// ❌ 잘못된 예시: 에러 메시지가 없음
const UserForm = () => {
  const [email, setEmail] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      // 에러 처리 없음
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button>Submit</button>
    </form>
  )
}
```

```tsx
// ✅ 올바른 예시: 에러 메시지와 유효성 검사
const UserForm = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Email is required')
    } else if (!validateEmail(email)) {
      setError('Please enter a valid email address')
    } else {
      setError('')
      // 제출 로직
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-invalid={!!error}>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-describedby="email-error"
        className={error ? 'border-red-500' : 'border-gray-300'}
      />
      {error && (
        <p id="email-error" className="text-red-500" role="alert">
          {error}
        </p>
      )}
      <button type="submit">Submit</button>
    </form>
  )
}
```

## 시맨틱 HTML

### 1. 올바른 헤딩 구조 사용

```tsx
// ❌ 잘못된 예시: 잘못된 헤딩 순서
<div>
  <h2>Introduction</h2>
  <h1>Main Title</h1>
</div>

// ✅ 올바른 예시: 올바른 헤딩 순서
<div>
  <h1>Main Title</h1>
  <h2>Introduction</h2>
</div>
```

### 2. 올바른 리스트 구조 사용

```tsx
// ❌ 잘못된 예시: 잘못된 리스트 태그
<text>
  1. First item
  2. Second item
</text>

// ✅ 올바른 예시: 올바른 리스트 태그
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>

// ✅ 정의 리스트 (Definition List)
<dl>
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>
  <dt>CSS</dt>
  <dd>Cascading Style Sheets</dd>
</dl>
```

## ARIA 속성

### 1. landmark 사용

```tsx
// ✅ 올바른 예시: landmark를 사용하여 페이지 구조 정의
<div role="main">
  <header>
    <nav aria-label="Main Navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <h1>Article Title</h1>
    <p>Article content...</p>
  </main>
  <footer>
    <nav aria-label="Footer Navigation">
      <ul>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
      </ul>
    </nav>
  </footer>
</div>
```

### 2. live region 사용

```tsx
// ✅ 올바른 예시: 동적 콘텐츠가 있는 곳에 live region 사용
function SearchResults({ results, loading }) {
  return (
    <div 
      role="region" 
      aria-live="polite" 
      aria-label="Search Results"
      aria-busy={loading}
    >
      {loading && <div>Searching...</div>}
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 3. label과 description 사용

```tsx
// ✅ 올바른 예시: label과 description 사용
<div className="form-group">
  <label htmlFor="search">Search</label>
  <input
    id="search"
    type="text"
    aria-describedby="search-description"
    placeholder="Search articles..."
  />
  <p id="search-description" className="text-sm text-gray-500">
    Enter keywords to search articles
  </p>
</div>
```

## 키보드 내비게이션

### 1. Focus Trap (포커스 트랩)

```tsx
import { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    firstElement?.focus()
    document.addEventListener('keydown', handleTabKey)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Close (ESC)
        </button>
      </div>
    </div>
  )
}
```

### 2. Skip Links (건너뛰기 링크)

```tsx
// ✅ 올바른 예시: 키보드 사용자를 위한 건너뛰기 링크
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute top-4 left-4 -translate-y-24 focus:translate-y-0 bg-blue-600 text-white px-4 py-2 rounded z-50"
    >
      Skip to main content
    </a>
  )
}

// 사용 예시
export function Layout() {
  return (
    <>
      <SkipLink />
      <header>Header</header>
      <main id="main-content">
        <h1>Main Content</h1>
      </main>
    </>
  )
}
```

## 색상 대비 (Color Contrast)

### 1. 텍스트와 배경의 대비율

WCAG 2.1 AA는 최소 4.5:1의 대비율을, AAA는 7:1의 대비율을 요구합니다.

```tsx
// ❌ 잘못된 예시: 낮은 대비율
<div className="bg-gray-200 text-gray-300">Low contrast text</div>

// ✅ 올바른 예시: 충분한 대비율
<div className="bg-white text-black">High contrast text</div>
```

### 2. 대비율 확인 도구

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Oracle](https://github.com/PGijsen/color-oracle)
- [Accessible Color Palette Builder](https://color.adobe.com/ko/accessibility-color)

## 이미지 접근성

### 1. alt 텍스트 제공

```tsx
// ❌ 잘못된 예시: alt 텍스트 없음
<img src="/path/to/image.jpg" />

// ✅ 올바른 예시: alt 텍스트 포함
<img
  src="/path/to/image.jpg"
  alt="A person sitting at a desk working on a computer"
  className="rounded-lg shadow-md"
/>
```

### 2. 복잡한 이미지에 대한 대체 텍스트

```tsx
// ✅ 올바른 예시: aria-describedby와 장설
<figure>
  <img
    src="/path/to/chart.png"
    alt="Line chart showing sales trends from 2020 to 2025"
    aria-describedby="chart-description"
  />
  <figcaption id="chart-description" className="text-sm text-gray-600">
    This chart shows a steady increase in sales from 2020 to 2025, with a significant spike in 2023.
  </figcaption>
</figure>
```

## 폼 접근성

### 1. 필수 필드 표시

```tsx
// ✅ 올바른 예시: 필수 필드 표시
<div className="form-group">
  <label htmlFor="email">
    Email address <span className="text-red-500" aria-hidden="true">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    className="border border-gray-300 rounded px-3 py-2"
    placeholder="name@example.com"
  />
</div>
```

### 2. 에러 메시지 연결

```tsx
// ✅ 올바른 예시: 에러 메시지 연결
const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
    } else if (!validateEmail(email)) {
      setError('Please enter a valid email address')
    } else {
      setError('')
      // 제출 로직
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
            aria-describedby="email-error"
            className={`border rounded px-3 py-2 ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error && (
            <p id="email-error" className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Log in
        </button>
      </div>
    </form>
  )
}
```

## 스크린 리더 테스트

### 1. 스크린 리더 설치

- Windows: [NVDA](https://www.nvaccess.com/)
- macOS: [VoiceOver](https://www.apple.com/voiceover/)
- Linux: [Orca](https://www.gnome.org/projects/orca/)

### 2. 스크린 리더에서 테스트

1. 키보드만 사용하여 모든 기능을 테스트
2. 스크린 리더로 모든 콘텐츠를 탐색
3. 색상 대비를 확인 (흑색 모드 사용 가능)
4. 이미지 대체 텍스트를 확인

## 결론

웹 접근성(A11y)을 높이면 다음과 같은 이점이 있습니다:

1. **법적 준수**: 많은 국가에서 웹 접근성을 법적으로 요구합니다.
2. **더 많은 사용자**: 장애인 사용자도 웹을 사용할 수 있습니다.
3. **SEO 향상**: 검색 엔진이 접근성을 고려합니다.
4. **브랜드 이미지**: 포용적 브랜드 이미지를 구축합니다.

실무에서는 WCAG 2.1의 4가지 원칙을 준수하여 접근성을 높이고, 스크린 리더에서 테스트하여 모든 사용자가 웹을 사용할 수 있도록 만들어야 합니다.
