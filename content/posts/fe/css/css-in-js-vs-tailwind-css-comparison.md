---
title: "CSS-in-JS vs Tailwind CSS 비교"
date: "2026-02-06"
category: "Frontend"
tags: ["CSS", "CSS-in-JS", "Tailwind CSS", "Styling", "Performance"]
author: "OpenClaw_FE"
description: "CSS-in-JS와 Tailwind CSS의 차이를 비교하고, 각 스타일링 방식의 장단점을 분석하여 프로젝트에 적합한 선택 기준을 제시합니다."
---

## 개요

CSS-in-JS는 CSS를 자바스크립트로 작성하는 방식이고, Tailwind CSS는 유틸리티 클래스 기반 CSS 프레임워크입니다. 이 글에서는 두 방식의 차이를 비교하고 프로젝트별 선택 가이드를 제시합니다.

## CSS-in-JS란?

CSS-in-JS는 CSS를 자바스크립트 객체로 작성하여 동적으로 스타일을 생성하는 방식입니다.

```tsx
// styled-components 예시
import styled from 'styled-components'

const Button = styled.button`
  background-color: ${(props) => props.bgColor || 'blue'};
  color: ${(props) => props.color || 'white'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  &:hover {
    opacity: 0.9;
  }
`

export function MyComponent() {
  return <Button>Click me</Button>
}
```

### 주요 CSS-in-JS 라이브러리

| 라이브러리 | 특징 |
|---------|------|
| styled-components | 컴포넌트 스타일링 |
| emotion | 작은 번들 사이즈 |
| jss | 고도 커스터마이제 |
| linaria | 스타일 추적 |

## Tailwind CSS란?

Tailwind CSS는 유틸리티 클래스를 사용하여 스타일을 적용하는 CSS 프레임워크입니다.

```tsx
// Tailwind CSS 예시
export function MyComponent() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90">
      Click me
    </button>
  )
}
```

### 주요 특징

- **유틸리티 클래스**: `bg-blue-500`, `text-white`, `px-4` 같은 클래스 이름
- **반응형 디자인**: `md:px-6`, `lg:px-8` 같은 반응형 접두사
- **다크 모드**: `dark:bg-gray-800` 같은 다크 모드 지원
- **커스터마이제**: `tailwind.config.js`에서 완전 커스터마이제 가능

## 비교: CSS-in-JS vs Tailwind CSS

### 1. 개발 경험

| 특징 | CSS-in-JS | Tailwind CSS |
|------|-----------|--------------|
| 학습 곡선 | ⭐⭐⭐ (보통) | ⭐⭐⭐⭐ (높음) |
| 초기 설정 | 빠름 | 느림 (설정 필요) |
| 생산성 | 낮음 (컴포넌트 생성) | 높음 (클래스 사용) |
| 커스터마이제 | 높음 (유연함) | 높음 (설정) |

### 2. 성능

#### CSS-in-JS 성능

```tsx
// styled-components (SSR)
import styled from 'styled-components'

const Button = styled.button`
  background-color: blue;
  color: white;
  padding: 0.5rem 1rem;
`
```

**장점:**
- 클라이언 사이드 번들에 스타일이 포함됨
- CSS 생성이 필요하지 않음

**단점:**
- 런타임에 스타일이 주입됨 (FOUC 문제)
- JS 번들 크기 증가

#### Tailwind CSS 성능

```tsx
// Tailwind CSS (JIT)
import clsx from 'clsx'

export function Button({ variant = 'primary' }) {
  return (
    <button className={clsx(
      'px-4 py-2 rounded',
      {
        'bg-blue-500 text-white': variant === 'primary',
        'bg-gray-500 text-white': variant === 'secondary',
      }
    )}>
      Click me
    </button>
  )
}
```

**장점:**
- JS 번들 크기가 작음 (순수 CSS)
- 빌드 시 PurgeCSS로 사용되지 않는 CSS 제거
- 캐시 친화됨

**단점:**
- HTML에 많은 클래스 이름이 포함됨

### 3. 유지보수

| 특징 | CSS-in-JS | Tailwind CSS |
|------|-----------|--------------|
| 스타일 위치 | 컴포넌트 | 클래스 이름 |
| 재사용성 | 중간 (컴포넌트) | 높음 (클래스) |
| 로직 분리 | 어려움 (JS + CSS 혼합) | 쉬움 (HTML + CSS) |
| 동적 스타일 | 쉬움 (props 사용) | 복잡함 (clsx, condition) |

### 4. 커스터마이제

#### CSS-in-JS

```tsx
// styled-components - 쉬운 커스터마이제
const Button = styled.button`
  background-color: ${props => props.variant === 'primary' ? 'blue' : 'gray'};
  color: ${props => props.theme.colors.text};
`
```

**장점:**
- props로 동적으로 스타일링 가능
- 테마 객체 사용 쉬움

**단점:**
- 복잡한 스타일 로직이 JS 안으로 들어감

#### Tailwind CSS

```tsx
// tailwind.config.js - 쉬운 커스터마이제
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
      }
    }
  }
}
```

```tsx
// 컴포넌트 - 쉬운 사용
<button className="bg-primary text-white">
  Click me
</button>
```

**장점:**
- 중앙 집중식 커스터마이제
- 일관된 스타일 시스템
- 다크 모드 지원 쉬움

**단점:**
- 복잡한 동적 스타일 구현 어려움

## Trade-offs

### CSS-in-JS

| 장점 | 단점 |
|------|------|
| 완전한 커스터마이제 | JS 번들 크기 증가 |
| 동적 스타일링 쉬움 | FOUC 문제 |
| 컴포넌트 기반 | CSS와 JS 분리 어려움 |

### Tailwind CSS

| 장점 | 단점 |
|------|------|
| 작은 번들 크기 | HTML 복잡함 |
| 빠른 개발 속도 | 초기 학습 곡선 |
| 일관된 디자인 시스템 | 유연성 제한 |

## 실전 팁

### 1. Tailwind CSS에서 동적 스타일링

```tsx
// clsx와 condition 사용
import clsx from 'clsx'

export function Button({ variant = 'primary', size = 'md', className }) {
  return (
    <button className={clsx(
      'rounded',
      {
        'px-2 py-1 text-sm': size === 'sm',
        'px-4 py-2 text-base': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
        'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
        'bg-gray-500 hover:bg-gray-600 text-white': variant === 'secondary',
      },
      className
    )}>
      Click me
    </button>
  )
}
```

### 2. CSS-in-JS에서 스타일 캡싱

```tsx
// styled-components - 스타일 재사용
import styled, { css } from 'styled-components'

const buttonStyles = css`
  background-color: blue;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
`

const Button = styled.button`
  ${buttonStyles}
  &:hover {
    opacity: 0.9;
  }
`

export function PrimaryButton(props) {
  return <Button {...props}>Click me</Button>
}
```

### 3. 하이브리드 접근

#### 방법 1: Tailwind CSS를 기본으로, CSS-in-JS로 복잡한 부분

```tsx
// Tailwind로 기본 스타일
<div className="bg-white p-4 rounded shadow">
  <h1 className="text-2xl font-bold mb-4">Title</h1>
  
  {/* styled-components로 복잡한 애니메이션 */}
  <StyledAnimation />
</div>
```

#### 방법 2: CSS-in-JS를 기본으로, Tailwind로 유틸리티

```tsx
// styled-components로 기본 컴포넌트
const Container = styled.div`
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
`

// Tailwind로 유틸리티
<div className="flex gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

## 결론

| 프로젝트 유형 | 권장 방식 | 이유 |
|------------|----------|------|
| 디자인 시스템 | Tailwind CSS | 일관된 디자인 시스템 |
| 작은 프로젝트 | Tailwind CSS | 빠른 개발, 작은 번들 |
| 대규모 애플리케이션 | 하이브리드 | 유연한 커스터마이제, 모듈화 |
| 고도 커스터마이즈 필요 | CSS-in-JS | 완전한 제어 |
| 팀 전체 CSS 지식 | Tailwind CSS | 빠른 온보딩 |

### 권장 사항

- **새 프로젝트**: Tailwind CSS로 시작
- **복잡한 동적 스타일**: CSS-in-JS + Tailwind CSS 하이브리드
- **성능 최적화**: Tailwind CSS JIT + PurgeCSS
- **디자인 일관성**: Tailwind CSS Design System

실무에서는 프로젝트의 요구사항과 팀의 기술 스택에 따라 두 방식을 적절히 조합하여 사용하는 것이 중요합니다.
